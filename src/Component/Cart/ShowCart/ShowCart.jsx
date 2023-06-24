import "./ShowCart.css";
import DrawKitVector from "../../../assets/DrawKit-Vector.svg";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";

function ShowCart() {
  const userActive = sessionStorage.getItem("id");

  const [orders, setorder] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  //GET ORDERS
  const getAllOrders = () => {
    fetch(`http://localhost:3001/Users/${userActive}`)
      .then((rep) => rep.json())
      .then((data) => {
        setorder(data.Orders.New_Cart);
      });
  };

  //RENDER ON CHANGE ORDERS
  useEffect(() => {
    getAllOrders();
  }, []);

  // DELETE TARGET ORDERS
  const DeleteItem = (ID) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to go hungry!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        swal("The product has been successfully deleted!", {
          icon: "success",
        });
        axios
          .get(`http://localhost:3001/Users/${userActive}`)
          .then(function (response) {
            const userData = response.data;
            const orderItem = userData.Orders.New_Cart.find(
              (item) => item.id === ID
            );
            const originalQuantity = orderItem.Qty; // Get the initial quantity of the order
            userData.Orders.New_Cart = userData.Orders.New_Cart.filter(
              (item) => item.id !== ID
            );

            axios
              .get(`http://localhost:3001/Products/${ID}`)
              .then(function (response) {
                const productData = response.data;
                productData.quantity += originalQuantity; // Return the original quantity to the product
                return axios.put(
                  `http://localhost:3001/Products/${ID}`,
                  productData
                );
              })
              .then((response) => {})
              .catch((error) => {
                console.log(error);
              });

            return axios.put(
              `http://localhost:3001/Users/${userActive}`,
              userData
            );
          })
          .then((response) => {
            getAllOrders();
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        swal("The deletion has been cancelled");
      }
    });
  };

  function decNum(order) {
    if (order.Qty > 1) {
      axios
        .get(`http://localhost:3001/Users/${sessionStorage.getItem("id")}`)
        .then(function (response) {
          const userData = response.data;
          const newCart = userData.Orders.New_Cart;
          const existingOrder = newCart.find((ele) => ele.id === order.id);
          if (existingOrder) {
            existingOrder.Qty -= 1;
            axios
              .get(`http://localhost:3001/Products/${order.id}`)
              .then(function (response) {
                const productData = response.data;
                productData.quantity += 1;
                return axios.put(
                  `http://localhost:3001/Products/${order.id}`,
                  productData
                );
              });
          } else {
            newCart.push(order);
          }
          return axios.put(
            `http://localhost:3001/Users/${sessionStorage.getItem("id")}`,
            userData
          );
        })
        .then(function () {
          // UPDATE SHOW DISPLAY
          const updatedOrders = orders.map((item) => {
            if (item.id === order.id) {
              return { ...item, Qty: item.Qty - 1 };
            }
            return item;
          });
          setorder(updatedOrders);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  function incNum(order) {
    console.log(order.Qty);
    console.log(order.quantity);

    if (order.quantity > order.Qty) {
      axios
        .get(`http://localhost:3001/Users/${sessionStorage.getItem("id")}`)
        .then(function (response) {
          const userData = response.data;
          const newCart = userData.Orders.New_Cart;
          const existingOrder = newCart.find((ele) => ele.id === order.id);
          if (existingOrder) {
            existingOrder.Qty += 1;
            axios
              .get(`http://localhost:3001/Products/${order.id}`)
              .then(function (response) {
                const productData = response.data;
                productData.quantity -= 1;
                return axios.put(
                  `http://localhost:3001/Products/${order.id}`,
                  productData
                );
              });
          } else {
            newCart.push(order);
          }
          return axios.put(
            `http://localhost:3001/Users/${sessionStorage.getItem("id")}`,
            userData
          );
        })
        .then(function () {
          // UPDATE SHOW DISPLAY
          const updatedOrders = orders.map((item) => {
            if (item.id === order.id) {
              return { ...item, Qty: item.Qty + 1 };
            }
            return item;
          });
          setorder(updatedOrders);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      swal("The product has been successfully deleted!", {
        icon: "error",
      });
    }
  }

  //ISHOW ALL ORDERS IN CARTS
  const allOrder = orders.map((order) => {
    return (
      <div
        className="border border-secondary-subtle rounded-4 ps-4 pe-4 pt-4 mb-4 d-flex justify-content-between"
        key={order.id}
      >
        <div className="Cart_item d-flex gap-5 flex-wrap">
          <div className="mb-3">
            <img src={order.image} alt="Cart_body" width="100" />
          </div>
          <div className="card-description" style={{ width: "270px" }}>
            <p className="title fw-bold">{order.category}</p>
            <p className="title_short text-body-secondary fw-semibold">
              {order.title}
            </p>
            <div className="Size_Qty mb-3 d-flex">
              <span className="p-2 bg-body-secondary me-2 fw-semibold d-flex align-items-center">
                Size: {order.size}
              </span>

              <div className="p-2  bg-light bg-body-secondary fw-semibold d-flex align-items-center">
                <span className="pe-3">Qty:</span>
                <div
                  className="d-flex align-items-center"
                  style={{ width: "130px" }}
                >
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={() => decNum(order)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={order.Qty}
                    min="1"
                  />
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={() => incNum(order)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="price mb-2">
              <span className="text-decoration-line-through me-3 fw-semibold">
                JOD. {order.price * 2}{" "}
              </span>
              <span className="fw-semibold">JOD ${order.price} </span>
            </div>
            <p className="fw-semibold d-flex align-items-center">
              <i className="fa-regular fa-circle-check me-2 fs-5"></i>{" "}
              <span className="text-body-secondary">
                Delivery by 9th Jan, 2023{" "}
              </span>
            </p>
          </div>
        </div>
        <div className="close" onClick={() => DeleteItem(order.id)}>
          <p className="fs-4">
            <i className="fa-solid fa-xmark"></i>
          </p>
        </div>
      </div>
    );
  });

  // TOTOAL PRICE IN CART
  useEffect(() => {
    const calculateTotalPrice = () => {
      const totalPrice = orders.reduce(
        (acc, order) => acc + order.price * order.Qty,
        0
      );
      setTotalPrice(Number(totalPrice.toFixed(2)));
    };
    calculateTotalPrice();
  }, [orders]);
  //INSERT ORDERS PAST ARRAY
  let navigate = useNavigate();
  function pastOrder(userID) {
    if (orders.length) {
      axios
        .get(`http://localhost:3001/Users/${userID}`)
        .then(function (response) {
          const userData = response.data;
          const PastOrder = userData.Orders.New_Cart;

          PastOrder.forEach((element) => {
            userData.Orders.Past_Order.push(element);
          });

          userData.Orders.New_Cart = [];
          return axios.put(`http://localhost:3001/Users/${userID}`, userData);
        })
        .then((response) => {
          navigate("/OrderPlaced");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      swal("Your cart is empty, no products have been added!");
    }
  }
  return (
    <>
      <div className="container Cart_Hero pt-5 pb-5">
        <div className="row">
          <div className="col-12 col-lg-6 vol-md-6 col-sm-12">
            <div className="Header_Cart mb-4">
              <span className="header_span d-flex align-items-baseline flex-wrap">
                <Link to="/Products">
                  <a className="text-dark back-page">
                    <i className="fa-solid fa-arrow-left me-3"></i>
                  </a>
                </Link>{" "}
                <h5 className="fw-bold me-3"> ORDER SUMMARY</h5>{" "}
                <li className="fw-bold fs-6 p-0 m-0"> {orders.length} Items</li>
              </span>
            </div>
            <div className="ms-4" style={{ width: "85%" }}>
              {allOrder}
            </div>
          </div>
          <div className="col-1">
            <div className="Line-vertical"></div>
          </div>
          <div className="col">
            <div className="d-flex flex-column" style={{ gap: "40px" }}>
              <div className="title justify-content-center bg-vector d-flex ps-5 pe-5 pt-3 pb-2 gap-5 rounded-2 align-items-baseline">
                <div>
                  <img src={DrawKitVector} alt="DrawKit-Vector" />
                </div>
                <p className="fs-6">
                  Yay! <span className="fw-bold">No Delivery Charge</span> on
                  this order.
                </p>
              </div>
              <div className="Applay">
                <p className="fw-bold">Have a Coupon?</p>
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  className="bg-vector w-100 pt-3 pb-3 ps-3 pe-3 border border-secondary-subtle rounded-2 "
                />
              </div>
              <div className="price_Details">
                <p className="fw-bold">PRICE DETAILS ({orders.length} ITEMS)</p>
                <ul className="p-0 m-0">
                  <li className="list-item">
                    <span>Total MRP</span> <span>JOD. {totalPrice}</span>
                  </li>
                  <li className="list-item">
                    <span>Discount on MRP</span>{" "}
                    <span className="free">JOD. 0</span>
                  </li>
                  <li className="list-item">
                    <span>Coupon Discount</span> <span>JOD. 0</span>
                  </li>
                  <li className="list-item">
                    <span>Delivery Charge</span>{" "}
                    <span className="free">Free</span>
                  </li>
                </ul>
                <div className="Line_horizontal"></div>
              </div>
              <div className="Place_Order">
                <li className="list-item">
                  <span>Delivery Charge</span>{" "}
                  <span className="free">JOD. {totalPrice}</span>
                </li>
                <button
                  onClick={() => pastOrder(userActive)}
                  className="button_Place mt-3 border border-secondary-subtle fw-semibold text-white rounded-2"
                >
                  Place Order <i className="fa-solid fa-arrow-right"></i>
                </button>
                {/* <Link to='/OrderPlaced'></Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default ShowCart;
