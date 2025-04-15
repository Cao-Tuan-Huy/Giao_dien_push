import React from "react";
import PhoneCard from "./components/PhoneCard";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const App: React.FC = () => {
  return (
    <div className="App">
      <PhoneCard />
    </div>
  );
};

export default App;