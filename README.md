## 🌾 APMC Market Advisor – AI for Farmers

**AI-powered farming insights with route optimization and demand forecasting**

🚀 [Live Demo (Vercel Deployment)](https://apmc-market-advisor.vercel.app/)

---

## 📌 Project Overview  
APMC Market Advisor is a web application that leverages **AI and machine learning** to assist farmers and traders in making data-driven decisions. The platform provides **market demand forecasting, seasonality analysis, and pricing strategy optimization** using open government data.

### ✨ Key Features
- 📈 **Market Demand Analysis**:  
  Built a **Neural Perceptron (Neural Prophet / neural forecasting)** model for 12-month demand forecasting.  
- 📊 **Seasonality Analysis**:  
  Identifies seasonal price fluctuations and recommends optimal selling periods.  
- 💰 **Pricing Strategy Model**:  
  Computes **net market price** after considering **logistics and transport costs**, distance, fuel, etc.  
- 🚛 **Route & Transport Cost Optimization**:  
  Suggests best markets by analyzing distance, fuel cost, and net profitability.  
- 📍 **Location-based Insights**:  
  Users can select their **state, district, and crop variety** to get personalized insights.

---

## 📂 Data Source

This project uses **“Variety-wise Daily Market Prices Data of Commodity”** from the Indian Open Government Data Portal. :contentReference[oaicite:0]{index=0}  
- This dataset is generated via AGMARKNET, which disseminates daily market price data (wholesale max, min, modal) for various commodities across mandis. :contentReference[oaicite:1]{index=1}  
- Fields include: State, District, Market, Commodity, Variety, etc. :contentReference[oaicite:2]{index=2}  
- The dataset is updated regularly (latest update shown as 01/10/2025). :contentReference[oaicite:3]{index=3}  

By using this open data, the model can be retrained or extended when newer data becomes available.

---

## 🎥 Working Video  
Link:- https://youtu.be/t5-2VpFv0Lg
---

## 🖼️ Screenshots

### 📍 Location & Forecasting  
<img width="1349" height="610" alt="image" src="https://github.com/user-attachments/assets/b617a470-567a-4c18-ae4f-307f0e3e26fb" /> 

### 🏬 Best Markets Recommendations  
<img width="761" height="616" alt="image" src="https://github.com/user-attachments/assets/f0f86c5b-e7c1-4d2b-a0c0-c80f9f76212f" /> 

### ⛽ Vehicle & Fuel Information  
<img width="388" height="547" alt="image" src="https://github.com/user-attachments/assets/818f11dc-6877-4adc-8d2a-0097504c3fdc" />

---

## 🛠️ Tech Stack  
- **Frontend**: React.js, Tailwind CSS  
- **Backend / AI Models**: Python, Neural Prophet (or neural network forecasting)  
- **Deployment**: Vercel  
- **Data**: AGMARKNET / Indian OGD (via “Variety-wise Daily Market Prices”)  

---

## 🚀 How to Run Locally  
```bash
# Clone the repository
git clone https://github.com/your-username/apmc-market-advisor.git
cd apmc-market-advisor

# Install dependencies
npm install

# Start the development server
npm run dev
````

---

## 📌 Future Improvements

* Integrate **API access** to the OGD dataset (or AGMARKNET) for live updates.
* Add **weekly or intraday forecasting** components.
* Expand to more crops, include farmer cooperative recommendations, etc.
* Add visual dashboards and alerts for price surges or dips.

---

## 👨‍💻 Author

**Virendra Badgotya**
🔗 [GitHub](https://github.com/vir123-devf) | [LinkedIn](https://www.linkedin.com/in/virendra-badgotya-ai/)

```

If you like, I can create a **complete README in Markdown** ready to drop into your repo (with embedded video iframe, polished formatting, etc.). Do you want me to generate that final version for you?
::contentReference[oaicite:4]{index=4}
```
