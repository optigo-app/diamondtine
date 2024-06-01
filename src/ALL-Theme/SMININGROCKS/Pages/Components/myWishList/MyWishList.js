import React, { useEffect, useState } from "react";
import Header from "../home/Header/Header";
import "./MyWishList.css";
import Footer from "../home/Footer/Footer";
import { CommonAPI } from "../../../Utils/API/CommonAPI";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { Button, CircularProgress, Dialog, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, useMediaQuery } from "@mui/material";
import { useSetRecoilState } from "recoil";
import { CartListCounts, WishListCounts } from "../../../../../Recoil/atom";
import { GetCount } from "../../../Utils/API/GetCount";
import notFound from "../../assets/image-not-found.png";
import { FilterListAPI } from "../../../Utils/API/FilterListAPI";
import { productListApiCall } from "../../../Utils/API/ProductListAPI";
import { getDesignPriceList } from "../../../Utils/API/PriceDataApi";
import { toast } from "react-toastify";

export default function MyWishList() {
  const [wishlistData, setWishlistData] = useState([]);
  const [wishlistDataNew, setWishlistDataNew] = useState([]);
  const [yKey, setYouKey] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPriseShow, setIsPriceShow] = useState("");
  const [cuurencySymbol, setCuurencySymbol] = useState("");
  const setCartCount = useSetRecoilState(CartListCounts);
  const setWishCount = useSetRecoilState(WishListCounts);
  const navigation = useNavigate();
  const [currData, setCurrData] = useState()
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  //   const handelCurrencyData = () =>{
  //     let currencyData = JSON.parse(localStorage.getItem('CURRENCYCOMBO'));
  //     let loginData = JSON.parse(localStorage.getItem('loginUserDetail'));
  //     console.log("param",loginData);

  //     if(currencyData && loginData){
  //       const filterData = currencyData?.filter((cd)=>cd?.Currencyid === loginData?.CurrencyCodeid)[0]
  //       console.log("currencyData",filterData);
  //       if(filterData){
  //         setCurrData(filterData)
  //       }
  //       else{
  //         let DefaultObj = {
  //           "Currencyid": 42,
  //           "Currencycode": "INR",
  //           "Currencyname": "Rupees",
  //           "Currencysymbol": "₹",
  //           "CurrencyRate": 1.00000,
  //           "IsDefault": 1
  //       }
  //       const DefaultObjData = currencyData?.filter((cd)=>cd?.IsDefault == 1)
  //       if(DefaultObjData.length > 0){
  //         setCurrData(DefaultObjData[0])
  //       }else{
  //         setCurrData(DefaultObj);
  //       }
  //       }
  //     }
  // }  

  useEffect(() => {
    // handelCurrencyData();
    let loginData = JSON.parse(localStorage.getItem('loginUserDetail'));
    let obj = { "CurrencyRate": loginData?.CurrencyRate, "Currencysymbol": loginData?.Currencysymbol }
    if (obj) {
      setCurrData(obj)
    }
  }, [])

  const getCountFunc = async () => {
    await GetCount().then((res) => {
      if (res) {
        setCartCount(res.CountCart);
        setWishCount(res.WishCount);
      }
    });
  };
  useEffect(() => {
    const storeInit = JSON.parse(localStorage.getItem("CURRENCYCOMBO"));
    const { Currencysymbol } = storeInit;
    setCuurencySymbol(Currencysymbol);

    const fetchData = async () => {
      try {
        wishlistData.length === 0 && setIsLoading(true);
        const storeInit = JSON.parse(localStorage.getItem("storeInit"));
        const storedData = localStorage.getItem("loginUserDetail");
        const ImageURL = localStorage.getItem("UploadLogicalPath");
        setImageURL(ImageURL);
        const data = JSON.parse(storedData);
        const customerid = data.id;
        const priseShow = storeInit.IsPriceShow;
        setIsPriceShow(priseShow);
        setCustomerID(data.id);
        const customerEmail = data.userid;
        setUserEmail(customerEmail);
        const { FrontEnd_RegNo, ukey } = storeInit;
        setYouKey(ukey);
        const combinedValue = JSON.stringify({
          is_show_stock_website: "0",
          PageSize: "1000",
          CurrentPage: "1",
          FrontEnd_RegNo: `${FrontEnd_RegNo}`,
          Customerid: `${customerid}`,
          UploadLogicalPath: "",
          ukey: `${ukey}`,
          ThumDefImg: "",
          CurrencyRate: "1",
        });
        const encodedCombinedValue = btoa(combinedValue);
        const body = {
          con: `{\"id\":\"Store\",\"mode\":\"GetWishList\",\"appuserid\":\"${customerEmail}\"}`,
          f: "MyWishList (GetWishList)",
          p: encodedCombinedValue,
        };
        const response = await CommonAPI(body);
        if (response.Data) {
          setWishlistData(response?.Data?.rd);
          getCartAndWishListData(response?.Data?.rd);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        // setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = async (autoCode) => {
    try {
      setIsLoading(true);
      const storeInit = JSON.parse(localStorage.getItem("storeInit"));
      const { FrontEnd_RegNo } = storeInit;
      const combinedValue = JSON.stringify({
        autocodelist: `${autoCode}`,
        ischeckall: "",
        FrontEnd_RegNo: `${FrontEnd_RegNo}`,
        Customerid: `${customerID}`,
      });
      const encodedCombinedValue = btoa(combinedValue);
      const body = {
        con: `{\"id\":\"Store\",\"mode\":\"addwishlisttocart\",\"appuserid\":\"${userEmail}\"}`,
        f: "MyWishLsit(addwishlisttocart)",
        p: encodedCombinedValue,
      };
      const response = await CommonAPI(body);
      if (response.Data.rd[0].stat === 1) {
        setWishlistDataNew((prevData) =>
          prevData.filter((item) => item.autocode !== autoCode)
        );
        getCountFunc();
        navigation("/myWishList");
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAll = async () => {
    try {
      setIsLoading(true);
      const storeInit = JSON.parse(localStorage.getItem("storeInit"));
      const { FrontEnd_RegNo } = storeInit;
      const combinedValue = JSON.stringify({
        autocodelist: "",
        ischeckall: "1",
        FrontEnd_RegNo: `${FrontEnd_RegNo}`,
        Customerid: `${customerID}`,
      });
      const encodedCombinedValue = btoa(combinedValue);
      const body = {
        con: `{\"id\":\"Store\",\"mode\":\"addwishlisttocart\",\"appuserid\":\"${userEmail}\"}`,
        f: "MyWishLsit(addwishlisttocart)",
        p: encodedCombinedValue,
      };
      const response = await CommonAPI(body);
      if (response.Data.rd[0].stat === 1) {
        setWishlistData([]);
        setWishlistDataNew([]);
        getCountFunc();
        navigation("/myWishList");
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveWichList = async (data) => {
    try {
      setIsLoading(true);
      const storeInit = JSON.parse(localStorage.getItem("storeInit"));
      const { FrontEnd_RegNo } = storeInit;
      const combinedValue = JSON.stringify({
        designlist: `'${data.designno}'`,
        isselectall: "0",
        FrontEnd_RegNo: `${FrontEnd_RegNo}`,
        Customerid: `${customerID}`,
      });
      const encodedCombinedValue = btoa(combinedValue);
      const body = {
        con: `{\"id\":\"Store\",\"mode\":\"removeFromWishList\",\"appuserid\":\"${userEmail}\"}`,
        f: "myWishLisy (handleRemoveWichList)",
        p: encodedCombinedValue,
      };
      const response = await CommonAPI(body);
      if (response.Data.rd[0].stat === 1) {
        setWishlistDataNew((prevData) =>
          prevData.filter((item) => item.designno !== data.designno)
        );
        getCountFunc();
        navigation("/myWishList");
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAllWishList = async () => {
    handleClose();
    try {
      setIsLoading(true);
      const storeInit = JSON.parse(localStorage.getItem("storeInit"));
      const { FrontEnd_RegNo } = storeInit;
      const combinedValue = JSON.stringify({
        designlist: "",
        isselectall: "1",
        FrontEnd_RegNo: `${FrontEnd_RegNo}`,
        Customerid: `${customerID}`,
      });
      const encodedCombinedValue = btoa(combinedValue);
      const body = {
        con: `{\"id\":\"Store\",\"mode\":\"removeFromWishList\",\"appuserid\":\"${userEmail}\"}`,
        f: "myWishLisy (handleRemoveWichList)",
        p: encodedCombinedValue,
      };
      const response = await CommonAPI(body);
      if (response.Data.rd[0].stat === 1) {
        // alert('Remove Success');
        // window.location.reload();
        setWishlistData([]);
        setWishlistDataNew([]);
        getCountFunc();
        navigation("/myWishList");
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handelProductSubmit = (product) => {
    console.log("producrrrrrrrrrrr", JSON.stringify(product));
    // localStorage.setItem("srProductsData", JSON.stringify(product));
    // navigation("/productdetail");
  };

  const decodeEntities = (html) => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const handelBrowse = async () => {
    navigation("/productpage")

    let finalData = JSON.parse(localStorage.getItem("menuparams"))

    if (finalData) {
      await FilterListAPI(finalData)
      await productListApiCall(finalData).then((res) => {
        if (res) {
          localStorage.setItem("allproductlist", JSON.stringify(res))
          localStorage.setItem("finalAllData", JSON.stringify(res))
        }
        return res
      }).then(async (res) => {
        if (res) {
          let autoCodeList = JSON.parse(localStorage.getItem("autoCodeList"))
          await getDesignPriceList(finalData, 1, {}, {}, autoCodeList)
        }
      }).catch((err) => {
        if (err) toast.error("Something Went Wrong!!!")
      })
    }
  }



  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const getCartAndWishListData = async (wishListData) => {

    const UserEmail = localStorage.getItem("registerEmail")
    const storeInit = JSON.parse(localStorage.getItem("storeInit"))
    const Customer_id = JSON.parse(localStorage.getItem("loginUserDetail"));

    let EncodeData = { FrontEnd_RegNo: `${storeInit?.FrontEnd_RegNo}`, Customerid: `${Customer_id?.id}` }

    const encodedCombinedValue = btoa(JSON.stringify(EncodeData));

    const body = {
      "con": `{\"id\":\"Store\",\"mode\":\"getdesignnolist\",\"appuserid\":\"${UserEmail}\"}`,
      "f": " useEffect_login ( getdataofcartandwishlist )",
      "p": encodedCombinedValue
    }

    await CommonAPI(body).then((res) => {
      if (res?.Message === "Success") {
        const compareAndSetMatch = (arr1, arr2) => {
          const autocodeSet = new Set(arr1.map(item => item.autocode));
          return arr2.map(item => {
            if (autocodeSet.has(item.autocode)) {
              return { ...item, match: "true" };
            } else {
              return { ...item, match: "false" };
            }
          });
        };
        const result = compareAndSetMatch(res?.Data?.rd, wishListData);
        setWishlistDataNew(result);
        wishlistDataNew.length === 0 && setIsLoading(false);
      }
    })

  }

  console.log('wishlistData New', wishlistDataNew);
  console.log('wishlistData', wishlistData);

  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div
      className="paddingTopMobileSet">
      {isLoading && (
        <div className="loader-overlay">
          <CircularProgress className="loadingBarManage" />
        </div>
      )}

      <Dialog open={open} onClose={handleClose}>
        <p style={{ padding: '15px 15px 0px 15px', fontWeight: 500 }}>Are You Sure To Delete Alll This Item?</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <Button onClick={handleClose} color="primary">
            NO
          </Button>
          <Button onClick={handleRemoveAllWishList} color="primary">
            YES
          </Button>
        </div>
      </Dialog>

      <div>
        <div className="smiling-wishlist">
          <p className="SmiWishListTitle">My Wishlist</p>

          {/* {wishlistData?.length !== 0 && (
            <div className="smilingListTopButton">
              <button className='smiTopShareBtn'>SHARE WISHLIST</button>
              <Button
                className="smiTopAddAllBtn"
                onClick={handleClickOpen}
              >
                Clear All
              </Button>
              <Button className="smiTopAddAllBtn" onClick={handleAddAll}>
                Add To Cart All
              </Button>
              <button
                className="smiTopAddAllBtn"
                onClick={() => navigation("/productpage")}
              >
                Show ProductList
              </button>
            </div>
          )} */}

          {/* <div className="smiWishLsitBoxMain">
            {wishlistDataNew?.length === 0
              ? !isLoading && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: '50px'
                  }}
                >
                  <p
                    style={{
                      margin: "0px",
                      fontSize: "20px",
                      fontWeight: 500,
                    }}
                  >
                    No Data Available
                  </p>
                  <p>Please First Add To Wishlist Data</p>
                  <button
                    className="browseBtnMore"
                    onClick={() => handelBrowse()}
                  >
                    BROWSE OUR COLLECTION
                  </button>
                </div>
              )
              : wishlistDataNew?.map((item) => (
                <div key={item.id} className="smiWishLsitBox">
                  <div
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "5px",
                    }}
                  >
                    <IoClose
                      style={{
                        height: "30px",
                        width: "30px",
                        cursor: "pointer",
                        color: "rgb(0 0 0 / 66%)",
                      }}
                      onClick={() => handleRemoveWichList(item)}
                    />
                  </div>
                  <img
                    src={`${imageURL}/${yKey}/${item.DefaultImageName}`}
                    className="smiWishLsitBoxImge"
                    style={{ cursor: "pointer" }}
                    alt="Wishlist item"
                    onClick={() => handelProductSubmit(item)}
                    onError={(e) => {
                      e.target.src = notFound;
                    }}
                  />
                  <p className="smiWishLsitBoxTitltLine">
                    {item.TitleLine}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignContent: "center",
                      marginInline: "2%",
                    }}
                  >
                    <p className="smiWishLsitBoxDesc2">
                      DWT: {(item.totaldiamondweight)?.toFixed(2)}
                    </p>
                    {isPriseShow == 1 && (
                      <p className="smiWishLsitBoxDescPrice">
                        {
                          <div
                            dangerouslySetInnerHTML={{
                              __html: decodeEntities(
                                currData?.Currencysymbol
                              ),
                            }}
                            style={{ fontFamily: "serif", marginTop: '2px' }}
                          />
                        }
                        {item.TotalUnitCost}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignContent: "center",
                      marginInline: "2%",
                      paddingBottom: "18%",
                    }}
                    className="mobileViewDeac"
                  >
                    <p className="smiWishLsitBoxDesc2">
                      GWT: {(item.ActualGrossweight)?.toFixed(2)}
                    </p>
                    <p className="smiWishLsitBoxDesc1">{item.designno}</p>


                  </div>
                  {
                    item.match === 'true' ?
                      <div
                        style={{
                          display: "flex",
                          position: "absolute",
                          bottom: "0px",
                          width: "100%",
                          justifyContent: "center",
                          marginBlock: "15px",
                        }}
                        className="mobilkeAddToCartBtn"
                      >
                        <button
                          className="smiWishLsitBoxDesc4"
                          disabled
                        >
                          ITEM IN A CART
                        </button>
                      </div>
                      :
                      <div
                        style={{
                          display: "flex",
                          position: "absolute",
                          bottom: "0px",
                          width: "100%",
                          justifyContent: "center",
                          marginBlock: "15px",
                        }}
                        className="mobilkeAddToCartBtn"
                      >
                        <button
                          className="smiWishLsitBoxDesc3"
                          onClick={() => handleAddToCart(item.autocode)}
                        >
                          ADD TO CART +
                        </button>
                      </div>
                  }
                </div>
              ))}
          </div> */}
        </div>
      </div>

      <div className="myWishlistMainContainer">
        <div className={wishlistDataNew?.length != 0 ? "mywislistComponents" : "mywislistComponentsNoData"}>
          {/* <div className="table-responsive"> */}
          <table className="table table-vertical-border table-custom">
            <thead className="thead-dark table-customThead">
              <tr className="table-customTr">
                <th style={{ padding: '15px 0px 15px 0px' }}>Product</th>
                <th style={{ padding: '15px 0px 15px 0px' }}>Price</th>
                {/* <th style={{padding:'15px 0px 15px 0px'}}>Stock Status</th> */}
                <th style={{ padding: '15px 0px 15px 0px' }}></th>
                <th style={{ padding: '15px 0px 15px 0px' }}></th>
              </tr>
            </thead>
            {wishlistDataNew?.length === 0
              ? !isLoading && (
                <tbody className="table-customTbody">
                  <tr className="table-customTr">
                    <td className="align-middle" style={{ padding: '20px 2px 20px 0px' }}>No products added to the wishlist</td>
                    <td className="align-middle" style={{ padding: '20px 2px 20px 0px' }}></td>
                    <td className="align-middle" style={{ padding: '20px 2px 20px 0px' }}></td>
                  </tr>
                </tbody>

              ) :
              <>
                {!isMobile ? (
                  <tbody className="table-customTbody">
                    {
                      wishlistDataNew.map((product) => (
                        <tr className="table-customTr" key={product.id}>
                          <td className="align-middle imagetextTd d-flex align-items-center justify-content-start">
                            <img
                              src={`${imageURL}/${yKey}/${product.DefaultImageName}`}
                              className=""
                              style={{ cursor: "pointer", maxWidth: '180px', maxHeight: '180px' }}
                              alt="Wishlist item"
                              onClick={() => handelProductSubmit(product)}
                              onError={(e) => {
                                e.target.src = notFound;
                              }}
                            />
                            <div className="product-title">
                              {product.TitleLine}
                            </div>
                          </td>
                          <td className="align-middle">
                            {isPriseShow === 1 && (
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <span style={{ marginRight: '5px' }}>From: </span>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: decodeEntities(currData?.Currencysymbol),
                                  }}
                                  style={{
                                    fontFamily: "serif",
                                    marginRight: "1px",
                                  }}
                                />
                                {product.TotalUnitCost}
                              </div>
                            )}
                          </td>
                          {/* <td className="align-middle">{product.stockStatus}</td> */}
                          <td className="align-middle">
                            <Button
                              onClick={() => handleAddToCart(product.autocode)}
                              disableRipple={false}
                              sx={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                color: '#Af8238',
                                width: '100%',
                                minWidth: '150px',
                                '&:hover': { backgroundColor: 'transparent' },
                                '& .MuiTouchRipple-root': {
                                  backgroundColor: 'transparent',
                                },
                              }}
                            >
                              {product.match === 'true' ? 'ITEM IN CART' : 'ADD TO CART +'}
                            </Button>
                          </td>
                          <td className="align-middle closeIcon">
                            <IoClose
                              style={{
                                height: "30px",
                                width: "30px",
                                cursor: "pointer",
                                color: "rgba(210,212,215,1)",
                              }}
                              onClick={() => handleRemoveWichList(product)}
                            />
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                ) :
                  <tbody className="mobileTable">
                    {wishlistDataNew.map((product) => (
                      <tr key={product.id}>
                        <td style={{ position: 'relative', textAlign: 'center' }}>
                          <div style={{ marginBottom: '10px', display: 'block' }}>
                            <img src={`${imageURL}/${yKey}/${product.DefaultImageName}`} alt='#productImage' style={{ maxWidth: '170px' }} />
                          </div>
                          <div style={{ marginBottom: '10px', display: 'block' }}>{product.TitleLine}</div>
                          <div style={{ marginBottom: '10px', display: 'block' }}>
                            {isPriseShow === 1 && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: 'center' }}>
                                <span style={{ marginRight: '5px' }}>From: </span>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: decodeEntities(currData?.Currencysymbol),
                                  }}
                                  style={{
                                    fontFamily: "serif",
                                    marginRight: "1px",
                                  }}
                                />
                                {product.TotalUnitCost}
                              </div>
                            )}
                          </div>
                          <div style={{ marginBottom: '10px', display: 'block' }}>
                            <Button
                              onClick={() => handleAddToCart(product.autocode)}
                              disableRipple={false}
                              sx={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                color: '#Af8238',
                                width: '100%',
                                minWidth: '150px',
                                '&:hover': { backgroundColor: 'transparent' },
                                '& .MuiTouchRipple-root': {
                                  backgroundColor: 'transparent',
                                },
                              }}
                            >
                              {product.match === 'true' ? 'ITEM IN CART' : 'ADD TO CART +'}
                            </Button>
                          </div>
                          <div style={{ position: 'absolute', top: '5px', right: '5px' }}>
                            <IoClose
                              style={{
                                height: "30px",
                                width: "30px",
                                cursor: "pointer",
                                color: "rgba(210,212,215,1)",
                              }}
                              onClick={() => handleRemoveWichList(product)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                }
              </>
            }
          </table>
          {/* </div> */}
        </div>
      </div>


      {/* <div className="container">
        <table className="table table-bordered">
          <tbody>
            {wishlistDataNew.map((product) => (
              <tr key={product.id}>
                <td style={{ position: 'relative', textAlign: 'center' }}>
                  <div style={{ marginBottom: '10px', display: 'block' }}>
                    <img src={`${imageURL}/${yKey}/${product.DefaultImageName}`} alt='#productImage' style={{ maxWidth: '170px' }} />
                  </div>
                  <div style={{ marginBottom: '10px', display: 'block' }}>{product.TitleLine}</div>
                  <div style={{ marginBottom: '10px', display: 'block' }}>
                    {isPriseShow === 1 && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: 'center' }}>
                        <span style={{ marginRight: '5px' }}>From: </span>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: decodeEntities(currData?.Currencysymbol),
                          }}
                          style={{
                            fontFamily: "serif",
                            marginRight: "1px",
                          }}
                        />
                        {product.TotalUnitCost}
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: '10px', display: 'block' }}>
                    <Button
                      onClick={() => handleAddToCart(product.autocode)}
                      disableRipple={false}
                      sx={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        color: '#Af8238',
                        width: '100%',
                        minWidth: '150px',
                        '&:hover': { backgroundColor: 'transparent' },
                        '& .MuiTouchRipple-root': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {product.match === 'true' ? 'ITEM IN CART' : 'ADD TO CART +'}
                    </Button>
                  </div>
                  <div style={{ position: 'absolute', top: '5px', right: '5px' }}>
                    <IoClose
                      style={{
                        height: "30px",
                        width: "30px",
                        cursor: "pointer",
                        color: "rgba(210,212,215,1)",
                      }}
                      onClick={() => handleRemoveWichList(product)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      <div className="mobileFootreCs" style={{ width: '100%' }}>
        <Footer />
      </div>
    </div>
  );
}
