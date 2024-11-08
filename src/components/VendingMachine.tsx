import React, { useRef, useState } from "react";
import ProductSelection from "./ProductSelection";

type PaymentMethod = "cash" | "card";

export interface Product {
  name: string;
  price: number;
  stock: number;
  image: string;
}
const viewPhaseEnum = {
  productSelection: "productSelection",
  payment: "payment",
  cardPayment: "cardPayment",
  cardPaymentFail: "cardPaymentFail",
  paymentSuccess: "paymentSuccess",
  cashReturn: "cashReturn",
};
const products: Product[] = [
  {
    name: "콜라",
    price: 1100,
    stock: 2,
    image: process.env.PUBLIC_URL + "cola.PNG",
  },
  {
    name: "물",
    price: 600,
    stock: 1,
    image: process.env.PUBLIC_URL + "water.PNG",
  },
  {
    name: "커피",
    price: 700,
    stock: 0,
    image: process.env.PUBLIC_URL + "coffee.PNG",
  },
];

const VendingMachine: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(
    undefined
  );
  const [viewPhase, setViewPhase] = useState<String>(
    viewPhaseEnum.productSelection
  );
  const [balance, setBalance] = useState(0);
  let paymentStatus = useRef("");

  const sum = selectedProduct.reduce(
    (accumulator, product) => accumulator + product.price,
    0
  );
  const decreaseProductStock = () =>
    selectedProduct.forEach((selectedProduct) => {
      products.find((product) => {
        if (product.name === selectedProduct.name) {
          product.stock -= 1;
        }
      });
    });

  const handleCardPayment = () => {
    handlePaymentMethod("card");
    setViewPhase(viewPhaseEnum.cardPayment);
    let elapsedTime = 0;
    const intervalId = setInterval(() => {
      elapsedTime += 1000;
      if (elapsedTime === 3000) {
        const randNum = Math.random();
        if (randNum > 0.5) {
          // 결제 성공, 첫 번째 화면으로 이동
          setViewPhase(viewPhaseEnum.paymentSuccess);
          decreaseProductStock();
          paymentStatus.current = "success";
        } else {
          // 결제 실패 처리
          setViewPhase(viewPhaseEnum.cardPaymentFail);
          paymentStatus.current = "fail";
        }
      } else if (elapsedTime === 5000) {
        // 결제 실패 후 2초 후에 'payment'로 변경
        if (paymentStatus.current === "fail") {
          setViewPhase(viewPhaseEnum.payment);
        } else {
          setViewPhase(viewPhaseEnum.productSelection);
          setSelectedProduct([]);
        }
        clearInterval(intervalId);
        paymentStatus.current = "";
      }
    }, 1000);
  };

  const handleCashPayment = () => {
    if (balance < sum) {
      alert("금액이 모자랍니다");
    } else {
      decreaseProductStock();
      paymentStatus.current = `${balance - sum}원 회수하세요`;
      setPaymentMethod(undefined);
      setViewPhase(viewPhaseEnum.cashReturn);
      let elapsedTime = 0;
      const intervalId = setInterval(() => {
        elapsedTime += 1000;
        if (elapsedTime === 3000) {
          setViewPhase(viewPhaseEnum.productSelection);
          setSelectedProduct([]);
          clearInterval(intervalId);
          paymentStatus.current = "";
        }
      }, 1000);
    }
  };

  const handlePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };
  const insertCash = (amount: number) => {
    if (paymentMethod === "cash") {
      setBalance((prevBalance) => prevBalance + amount);
    }
  };
  const selectProduct = (productName: string) => {
    const product = products.find((b) => b.name === productName);
    if (product) {
      if (!selectedProduct.some((p) => p.name === productName)) {
        setSelectedProduct((prevSelected) => [...prevSelected, product]);
      } else {
        setSelectedProduct((prevSelected) =>
          prevSelected.filter((product) => product.name !== productName)
        );
      }
    }
  };

  const productSelection = (
    <>
      <div style={{ textAlign: "center" }}>
        <h1>Vending Machine</h1>
        <h2>제품 선택(MultiSelection 가능)</h2>
      </div>
      <ProductSelection
        products={products}
        onSelect={selectProduct}
        selectedProducts={selectedProduct}
      />
      {selectedProduct && <p>총합: {sum}원</p>}

      <div style={{ textAlign: "right" }}>
        <button
          style={{ fontSize: "15px" }}
          onClick={() => {
            if (sum !== 0) setViewPhase(viewPhaseEnum.payment);
            else alert("제품을 선택하세요");
          }}
        >
          결제
        </button>
      </div>
    </>
  );
  const payment = (
    // 결제 관련
    <div style={{ textAlign: "center" }}>
      <h1>Vending Machine</h1>
      <h2>결제 총액: {sum}</h2>
      <h2>
        {paymentMethod !== "cash" && (
          <button onClick={() => handlePaymentMethod("cash")}>현금</button>
        )}{" "}
        <button onClick={handleCardPayment}>카드</button>{" "}
        <button
          onClick={() => {
            setViewPhase(viewPhaseEnum.productSelection);
          }}
        >
          이전 화면
        </button>
      </h2>
      {paymentMethod === "cash" && (
        <div>
          <h3>금액을 넣어주세요</h3>
          {[100, 500, 1000, 5000, 10000].map((amount) => (
            <button
              style={{ marginRight: "5px" }}
              key={amount}
              onClick={() => insertCash(amount)}
            >
              {amount} 원
            </button>
          ))}
          <p>현재 금액: {balance} 원</p>
          <button onClick={handleCashPayment}>결제하기</button>
        </div>
      )}
    </div>
  );
  const cashOrCardPayment = (status: string) => {
    let message;
    switch (status) {
      case "success":
        message = "결제 성공";
        break;
      case "fail":
        message = "결제 실패";
        break;
      default:
        if (status.includes("회수")) {
          message = status;
          break;
        }
        message = "결제 진행 중";
        break;
    }
    return (
      <div style={{ textAlign: "center" }}>
        <h1>{message}</h1>
      </div>
    );
  };
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      {viewPhase === viewPhaseEnum.productSelection && productSelection}
      {viewPhase === viewPhaseEnum.payment && payment}
      {viewPhase === viewPhaseEnum.cardPayment &&
        cashOrCardPayment(paymentStatus.current)}
      {viewPhase === viewPhaseEnum.paymentSuccess &&
        cashOrCardPayment(paymentStatus.current)}
      {viewPhase === viewPhaseEnum.cardPaymentFail &&
        cashOrCardPayment(paymentStatus.current)}
      {viewPhase === viewPhaseEnum.cashReturn &&
        cashOrCardPayment(paymentStatus.current)}
    </div>
  );
};

export default VendingMachine;
