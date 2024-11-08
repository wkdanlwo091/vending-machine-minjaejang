import React from "react";
import { Product } from "./VendingMachine";
import styled from "styled-components";

interface ProductSelectionProps {
  products: Product[];
  onSelect: (productName: string) => void;
  selectedProducts: Product[];
}

const Div = styled.div`
  display: flex;
  justify-content: start;
  gap: 10px;
`;
const Button = styled.button<{ selectedProduct?: string | undefined }>`
  display: flex;
  width: 120px;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: ${(props) =>
    props.selectedProduct !== undefined ? "2px solid red" : "2px solid white"};
`;

const ProductSelection: React.FC<ProductSelectionProps> = ({
  products,
  onSelect,
  selectedProducts,
}) => {
  console.log("rerendered");
  return (
    <Div>
      {products.map((b) => (
        <Button
          key={b.name}
          onClick={() => {
            onSelect(b.name);
          }}
          selectedProduct={
            selectedProducts.map((p) => p.name).includes(b.name)
              ? "selected"
              : undefined
          }
          disabled={b.stock === 0}
        >
          <img
            src={b.image}
            alt="cola"
            style={{
              display: "block",
              width: "50px",
              height: "100px",
              filter: `grayscale(${b.stock === 0 ? "100%" : "0%"})`,
            }}
          />
          {b.name} {b.price} 원
          <br />
          재고 {b.stock} 개
        </Button>
      ))}
    </Div>
  );
};

export default ProductSelection;
