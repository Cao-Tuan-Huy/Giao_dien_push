import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Dropdown, Row, Col } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Định nghĩa type cho tag-value
interface TagValue {
  id: number;
  tag: string;
  value: string | number;
  unit?: string;
  active?: boolean;
  condition?: number;
  valueType?: string;
  summary?: string;
  description?: string;
  layout: { x: number; y: number; w: number; h: number; minW?: number; minH?: number; i: string };
}

interface TagValueItemProps {
  item: TagValue;
  updateItem: (id: number, updatedItem: TagValue) => void;
  removeItem: (id: number) => void;
  handleDrop: (e: any, index: number) => void;
  index: number;
}

const conditionValues = ["Khoảng", "Nhỏ hơn", "Lớn hơn", "Bằng"];

// Component cho từng tag-value
const TagValueItem: React.FC<TagValueItemProps> = ({
  item,
  updateItem,
  removeItem,
  handleDrop,
  index,
}) => {
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const valueTagIsNumber = !isNaN(Number(item.value)) && item.value;
  const valueRef = useRef<HTMLDivElement>(null);

  // Tính toán chiều cao cần thiết dựa trên nội dung
  useEffect(() => {
    if (valueRef.current && !isEditingValue) {
      const lineHeight = 20; // Ước lượng chiều cao mỗi dòng (px)
      const padding = 6; // Padding trên/dưới của div (ước lượng từ my-1 và px-3)
      const contentHeight = valueRef.current.scrollHeight;
      const requiredLines = Math.ceil((contentHeight - padding * 2) / lineHeight);
      const newHeight = Math.max(2, requiredLines); // Đảm bảo tối thiểu h=2
      if (newHeight !== item.layout.h) {
        updateItem(item.id, {
          ...item,
          layout: { ...item.layout, h: newHeight },
        });
      }
    }
  }, [item.value, isEditingValue, item.id, item.layout.h, updateItem]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    updateItem(item.id, {
      ...item,
      value: isNaN(Number(newValue)) ? newValue : Number(newValue),
      valueType: !isNaN(Number(newValue)) ? "number" : "string",
    });
  };

  const handleUnitChange = (unit: string) => {
    updateItem(item.id, { ...item, unit });
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.detail === 1) {
      updateItem(item.id, { ...item, active: !item.active });
    } else if (e.detail === 2) {
      removeItem(item.id);
    }
  };

  const handleClickChangeTagCondition = (e: React.MouseEvent) => {
    e.preventDefault();
    if (valueTagIsNumber) {
      updateItem(item.id, {
        ...item,
        condition: ((item.condition || 0) + 1) % conditionValues.length,
      });
    }
  };

  const handleEditTag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditingTag(true);
  };

  const handleEditValue = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditingValue(true);
  };

  const isNumberValue = !isNaN(Number(item.value));
  const effectActive = !item.active ? "text-bg-secondary bg-opacity-25" : "";

  return (
    <Row
      className="position-relative w-100 h-100"
      draggable
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest(".dropdown-toggle, .dropdown-item")) {
          e.stopPropagation();
        }
      }}
      onDragStart={(e) => {
        if ((e.target as HTMLElement).closest("button, input, .dropdown-toggle, .dropdown-item, .tag-icon")) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", index.toString());
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, index)}
    >
      <Col xs={isNumberValue ? 4 : 6} lg={isNumberValue ? 3 : 4} className="pe-0 h-100">
        <div className="position-relative h-100">
          <div className={`border border-1 shadow-lg my-1 w-100 h-100 ${effectActive}`}>
            {isEditingTag ? (
              <input
                type="text"
                className="form-control h-100 border-0"
                value={item.tag}
                onChange={(e) => updateItem(item.id, { ...item, tag: e.target.value })}
                onBlur={() => setIsEditingTag(false)}
                onMouseDown={(e) => e.preventDefault()}
                autoFocus
                draggable={false}
              />
            ) : (
              <div
                className="h-100 d-flex align-items-center px-3"
                onMouseDown={handleEditTag}
                style={{ cursor: "pointer", zIndex: 10 }}
              >
                {item.tag}
              </div>
            )}
            <span
              className="tag-icon bx bx-purchase-tag"
              onClick={handleToggleActive}
              onMouseDown={(e) => e.preventDefault()}
              style={{
                position: "absolute",
                left: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </Col>

      {isNumberValue && (
        <Col xs={2} lg={1} className="px-0 ms-0 h-100">
          <button
            type="button"
            className={`form-control border border-1 shadow-lg btn btn-info text-black text-center rounded px-1 my-1 h-100 ${effectActive}`}
            onMouseDown={handleClickChangeTagCondition}
            onTouchStart={handleClickChangeTagCondition}
            draggable={false}
            style={{ cursor: "pointer", zIndex: 10 }}
          >
            {conditionValues[(item.condition || 0) % conditionValues.length]}
          </button>
        </Col>
      )}

      <Col
        xs={isNumberValue ? 3 : 6}
        lg={isNumberValue ? 6 : 8}
        className={isNumberValue ? "px-0" : "ps-0 h-100"}
      >
        {isEditingValue ? (
          <input
            type="text"
            className={`form-control border border-1 shadow-lg px-3 my-1 h-100 ${effectActive}`}
            value={item.value}
            onChange={handleValueChange}
            onBlur={() => setIsEditingValue(false)}
            onMouseDown={(e) => e.preventDefault()}
            autoFocus
            draggable={false}
          />
        ) : (
          <div
            ref={valueRef}
            className={`form-control border border-1 shadow-lg px-3 my-1 h-100 ${effectActive}`}
            onMouseDown={handleEditValue}
            style={{
              cursor: "pointer",
              zIndex: 10,
              overflow: "hidden",
              whiteSpace: "normal",
              wordWrap: "break-word",
            }}
          >
            {item.value}
          </div>
        )}
      </Col>

      {isNumberValue && (
        <Col xs={3} lg={2} className="ps-0 h-100">
          <Dropdown className="h-100" style={{ position: "relative", zIndex: 1000 + index * 10 }}>
            <Dropdown.Toggle
              variant="outline-secondary"
              className={`w-100 h-100 border border-1 shadow-lg rounded px-3 py-2 my-1 ${effectActive}`}
              onMouseDown={(e) => {
                e.preventDefault();
                console.log(`Dropdown toggle clicked for ${item.tag} (id: ${item.id})`);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                console.log(`Dropdown toggle touched for ${item.tag} (id: ${item.id})`);
              }}
              draggable={false}
              style={{ cursor: "pointer", zIndex: 1000 + index * 10, padding: "0.75rem 0.5rem", pointerEvents: "auto" }}
            >
              {item.unit || "Chọn đơn vị"}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ zIndex: 1001 + index * 10, minWidth: "100%", marginTop: "2px" }}>
              {["Gram", "Megapixel", "Core", "Centimet", "$", "VND", "USD"].map((unit) => (
                <Dropdown.Item
                  key={unit}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleUnitChange(unit);
                    console.log(`Selected unit ${unit} for ${item.tag} (id: ${item.id})`);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleUnitChange(unit);
                    console.log(`Touched unit ${unit} for ${item.tag} (id: ${item.id})`);
                  }}
                  style={{ cursor: "pointer", padding: "0.5rem 1rem" }}
                >
                  {unit}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      )}
    </Row>
  );
};

// Component chính
const PhoneCard: React.FC = () => {
  const [title, setTitle] = useState("Điện thoại HiSense A6L");
  const [image, setImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 200, height: 300 });
  const [items, setItems] = useState<TagValue[]>([
    {
      id: 1,
      tag: "Hãng",
      value: "HiSense",
      active: true,
      condition: 0,
      valueType: "string",
      layout: { x: 0, y: 0, w: 12, h: 2, minW: 4, minH: 2, i: "1" },
    },
    {
      id: 2,
      tag: "Tính năng",
      value: "Độc đáo, Bảo vệ mắt, 2 màn hình, sắc nét, công nghệ tiên tiến, hiệu suất cao",
      active: true,
      condition: 0,
      valueType: "string",
      layout: { x: 0, y: 1, w: 12, h: 2, minW: 4, minH: 2, i: "2" },
    },
    {
      id: 3,
      tag: "Camera trước",
      value: 20,
      unit: "Megapixel",
      active: true,
      condition: 0,
      valueType: "number",
      layout: { x: 0, y: 2, w: 12, h: 2, minW: 4, minH: 2, i: "3" },
    },
    {
      id: 4,
      tag: "Camera sau",
      value: 40,
      unit: "Megapixel",
      active: true,
      condition: 0,
      valueType: "number",
      layout: { x: 0, y: 3, w: 12, h: 2, minW: 4, minH: 2, i: "4" },
    },
    {
      id: 5,
      tag: "Bộ nhớ trong",
      value: 128,
      unit: "Gb",
      active: true,
      condition: 0,
      valueType: "number",
      layout: { x: 0, y: 4, w: 12, h: 2, minW: 4, minH: 2, i: "5" },
    },
    {
      id: 6,
      tag: "Giá",
      value: 3999000,
      unit: "VND",
      active: true,
      condition: 0,
      valueType: "number",
      layout: { x: 0, y: 5, w: 12, h: 2, minW: 4, minH: 2, i: "6" },
    },
    {
      id: 7,
      tag: "Ram",
      value: 6,
      unit: "Gb",
      active: true,
      condition: 0,
      valueType: "number",
      layout: { x: 0, y: 6, w: 12, h: 2, minW: 4, minH: 2, i: "7" },
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const addItem = () => {
    const newItem: TagValue = {
      id: items.length + 1,
      tag: "Tag mới",
      value: "Giá trị mới",
      active: true,
      condition: 0,
      valueType: "string",
      layout: {
        x: 0,
        y: items.length,
        w: 12,
        h: 2,
        minW: 4,
        minH: 2,
        i: (items.length + 1).toString(),
      },
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, updatedItem: TagValue) => {
    setItems(items.map((item) => (item.id === id ? updatedItem : item)));
  };

  const handleDrop = (e: any, index: number) => {
    const draggedItemIndex = e.dataTransfer.getData("text/plain");
    const updatedItems = [...items];
    const [draggedItem] = updatedItems.splice(parseInt(draggedItemIndex), 1);
    updatedItems.splice(Math.min(index, items.length - 1), 0, draggedItem);
    setItems(updatedItems);
    e.preventDefault();
  };

  const handleLayoutChange = (layouts: any[]) => {
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        layout: layouts.find((layout) => layout.i === item.layout.i) || item.layout,
      }))
    );
  };

  const handleImageResize = (
    event: any,
    { size }: { size: { width: number; height: number } }
  ) => {
    setImageSize({ width: size.width, height: size.height });
  };

  return (
    <div className="container mt-4 border rounded p-3 bg-light">
      <Form.Control
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-3"
        placeholder="Nhập tiêu đề"
      />

      <Row>
        <Col md={4} className="mb-3">
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control type="file" onChange={handleImageUpload} />
          </Form.Group>
          {image && (
            <ResizableBox
              width={imageSize.width}
              height={imageSize.height}
              onResize={handleImageResize}
              minConstraints={[100, 150]}
              maxConstraints={[400, 600]}
            >
              <img
                src={image}
                alt="Phone"
                className="img-fluid rounded"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </ResizableBox>
          )}
        </Col>

        <Col md={8}>
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: items.map((item) => item.layout) }}
            breakpoints={{ lg: 992, md: 768, sm: 576, xs: 0 }}
            cols={{ lg: 12, md: 8, sm: 6, xs: 4 }}
            rowHeight={20}
            width={600}
            onLayoutChange={handleLayoutChange}
            isResizable={true}
            isDraggable={true}
          >
            {items.map((item, index) => (
              <div key={item.layout.i}>
                <TagValueItem
                  item={item}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  handleDrop={handleDrop}
                  index={index}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
          <Button variant="primary" size="sm" onClick={addItem} className="mt-2">
            <FaPlus /> Thêm
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default PhoneCard;