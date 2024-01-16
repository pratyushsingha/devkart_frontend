import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import ProductItem from "../components/ProductItem";

export const AppContext = createContext();

function getLocalWish() {
  let wishes = localStorage.getItem("wish");
  if (wishes) {
    return JSON.parse(wishes);
  } else {
    return [];
  }
}

export default function AppContextProvider({ children }) {
  const { auth } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [categories, setCategories] = useState([]);
  const [page, setpage] = useState(1);
  const [itemOffset, setItemOffset] = useState(1);
  const [cartProducts, setCartProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState();
  const [wishList, setWishList] = useState(getLocalWish());
  const [couponCode, setCouponCode] = useState("");
  const [disCountedTotal, setDisCountedTotal] = useState();
  const [error, setError] = useState(false);
  const [coupon, setCoupon] = useState(false);
  const [allCoupon, setAllCoupon] = useState([]);
  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: Number,
    country: "India",
  });
  const [profileInfo, setProfileInfo] = useState({
    avatar: "",
    email: "",
    username: "",
    role: "",
  });

  const [allAddress, setAllAddress] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(Number);
  const [selectedPrice, setSelectedPrice] = useState(1000);

  const itemPerPage = 12;

  const getProducts = async () => {
    try {
      const response = await axios.get(
        `/ecommerce/products?page=${page}&limit=${itemPerPage}`
      );
      setProducts(response.data.data.products);
      // console.log(response)
    } catch (err) {
      alert(err);
    }
  };

  const getCategory = async () => {
    try {
      const response = await axios.get("/ecommerce/categories?page=1&limit=10");
      setCategories(response.data.data.categories);
      console.log(response.data.data.categories);
    } catch (err) {
      console.log(err);
    }
  };

  const endOffset = itemOffset + itemPerPage;
  // console.log(`Loading products from ${itemOffset} to ${endOffset}`);
  const currentItems = products.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(products.length / itemPerPage);

  function handlePageClick(event) {
    const newOffset = (event.selected * itemPerPage) % products.length;
    setItemOffset(newOffset);
    setpage(event.selected + 1);
    getProducts();
  }

  const addToCart = async (productId) => {
    try {
      if (localStorage.getItem("accessToken")) {
        const cartItems = await axios.get("/ecommerce/cart", {
          withCredentials: true,
        });

        const cartProductIds = cartItems.data.data.items.map(
          (item) => item.product._id
        );

        if (cartProductIds.includes(productId)) {
          toast.success("already added to cart");
        } else {
          const response = await axios.post(
            `/ecommerce/cart/item/${productId}`,
            {
              withCredentials: true,
            }
          );
          toast.success("Item added to cart");
        }
      } else {
        toast.error("please login to add item in cart");
      }
    } catch (err) {
      console.error(err);
      toast.error("something went wrong");
    }
  };

  const cartItemUpdate = async (id, qty) => {
    try {
      const response = await axios.post(
        `/ecommerce/cart/item/${id}`,
        {
          quantity: qty,
        },
        {
          withCredentials: true,
        }
      );
      // console.log(response);
    } catch (err) {
      console.error(err);
    }
  };

  const getCart = async () => {
    try {
      setLoader(true);
      const response = await axios.get("ecommerce/cart", {
        withCredentials: true,
      });
      setCartProducts(response.data.data.items);
      setCartTotal(response.data.data.cartTotal);
      setDisCountedTotal(response.data.data.discountedTotal);
      setLoader(false);
    } catch (err) {
      console.error(err);
      setLoader(false);
    }
  };

  const cartItemIncrement = async (id, quantity) => {
    try {
      await cartItemUpdate(id, quantity);
      getCart();
    } catch (err) {
      console.log(err);
    }
  };

  const DeleteFromCart = async (id) => {
    try {
      setLoader(true);
      const response = await axios.delete(`/ecommerce/cart/item/${id}`, {
        withCredentials: true,
      });
      console.log(response);
      getCart();
      setLoader(false);
    } catch (err) {
      console.error(err);
      setLoader(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoader(true);
      const response = await axios.delete("ecommerce/cart/clear");
      console.log(response);
      getCart();
      setLoader(false);
    } catch (err) {
      console.log(err);
      setLoader(false);
    }
  };

  function addToWish(id) {
    if (localStorage.getItem("accessToken")) {
      const updatedWish = products.find((item) => item._id === id);
      console.log(updatedWish);
      setWishList([...wishList, updatedWish]);
      toast.success("Item added to wishlist");
    } else {
      toast.error("please login add in wishlist");
      setLoader(false);
    }
  }

  function removeFromWish(id) {
    const removeWish = wishList.filter((item) => item._id !== id);
    setWishList(removeWish);
    toast.success("Item removed from wishlist");
  }

  useEffect(() => {
    localStorage.setItem("wish", JSON.stringify(wishList));
  }, [wishList]);

  const availableCoupons = async () => {
    try {
      setLoader(true);
      const response = await axios.get(
        "/ecommerce/coupons/customer/available?page=1&limit=10",
        {
          withCredentials: true,
        }
      );
      // console.log(response.data.data.coupons);
      setAllCoupon(response.data.data.coupons);
      setLoader(false);
    } catch (err) {
      console.log(err);
      setLoader(false);
    }
  };

  const applyCoupon = async (couponCode) => {
    try {
      const response = await axios.post(
        "/ecommerce/coupons/c/apply",
        {
          couponCode: couponCode,
        },
        {
          withCredentials: true,
        }
      );
      setCoupon(true);
      getCart();
      setCouponCode("");
      setError(false);
    } catch (err) {
      console.log(err);
      setLoader(false);
      setError(true);
    }
  };

  const removeCoupon = async (couponCode) => {
    try {
      const response = await axios.post(
        "/ecommerce/coupons/c/remove",
        { couponCode: couponCode },
        { withCredentials: true }
      );
      // console.log(response);
      getCart();
      setCoupon(false);
      setError(false);
    } catch (err) {
      console.log(err);
      setLoader(false);
    }
  };

  const getAddress = async () => {
    try {
      const response = await axios.get("/ecommerce/addresses");
      // console.log(response);
      setAllAddress(response.data.data.addresses);
    } catch (err) {
      console.log(err);
      setLoader(false);
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("ecommerce/addresses", address, {
        withCredentials: true,
      });
      console.log(response);
      getAddress();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    availableCoupons();
  }, [cartProducts]);

  const getProfile = async () => {
    try {
      setLoader(true);
      const response = await axios.get("/users/current-user");
      // console.log(response.data.data.avatar.url);
      setProfileInfo({
        avatar: response.data.data.avatar.url,
        email: response.data.data.email,
        username: response.data.data.username,
        role: response.data.data.role,
      });
      setLoader(false);
    } catch (err) {
      console.log(err);
      setLoader(false);
    }
  };

  function handleCategory(e) {
    setSelectedCategory(e.target.value);
    console.log(e.target.value);
  }

  function handleInputChange(e) {
    setQuery(e.target.value);
  }

  function filteredItems(product) {
    return product.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
  }

  function handlePrice(e) {
    setSelectedPrice(e.target.value);
  }

  function filterData(products, selectedPrice, query) {
    let filteredProducts = products;
    if (query) {
      filteredProducts = filteredProducts.filter(function (product) {
        return product.name.toLowerCase().includes(query.toLowerCase());
      });
    }

    if (selectedPrice) {
      filteredProducts = filteredProducts.filter(function (product) {
        return product.price <= selectedPrice;
      });
    }

    // if (selectedCategory) {
    //  console.log(selectedCategory)
    // }

    return filteredProducts.map(function (product) {
      return (
        <ProductItem
          key={product._id}
          _id={product._id}
          name={product.name}
          mainImage={product.mainImage.url}
          price={product.price}
        />
      );
    });
  }

  const result = filterData(products, selectedPrice, query);

  useEffect(() => {
    getProducts();
    getCategory();
    getAddress();
    getProfile();
    getCart();
  }, []);

  const value = {
    getProducts,
    products,
    addToCart,
    quantity,
    setQuantity,
    cartItemUpdate,
    categories,
    getCategory,
    handlePageClick,
    pageCount,
    getCart,
    cartItemIncrement,
    DeleteFromCart,
    cartProducts,
    cartTotal,
    clearCart,
    wishList,
    addToWish,
    removeFromWish,
    applyCoupon,
    couponCode,
    setCouponCode,
    disCountedTotal,
    setDisCountedTotal,
    error,
    removeCoupon,
    coupon,
    allCoupon,
    address,
    setAddress,
    saveAddress,
    getAddress,
    allAddress,
    profileInfo,
    setProfileInfo,
    getProfile,
    loader,
    setLoader,
    selectedCategory,
    handleCategory,
    handleInputChange,
    selectedPrice,
    handlePrice,
    query,
    result,
    filteredItems,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
