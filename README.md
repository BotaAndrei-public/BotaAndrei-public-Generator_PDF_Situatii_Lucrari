# SituatiiDeLucrariGenerator

**SituatiiDeLucrariGenerator** is a web application designed to streamline the creation of **"Situații de Lucrări" (Work Progress Reports)** - essential documents in Romanian construction paperwork.
- **Live Demo**: [Open](https://botaandrei-public.github.io/BotaAndrei-public-Generator_PDF_Situatii_Lucrari/)
## Key Features

- Dynamic work item management with **add/remove functionality**.
- **Real-time automatic calculations** with visual feedback animations (values turn green when updated).
- Flexible **formula-based computation**: select which fields to multiply (Quantity × Hours × Rate).
- **Professional PDF generation** with company branding, logos, and certifications.
- **Automatic page breaks** - multi-page documents handled seamlessly.
- Optional **signature/stamp image attachment** for authenticated documents.
- Support for **subcontractor information** and complex project structures.
- **VAT calculation (21%)** and automatic totals tracking.

## Purpose

The application is primarily designed as a **utility tool for small family construction businesses**, but it can also serve as a **template for construction documentation systems**. It reduces document creation time from 30+ minutes to under 5 minutes while eliminating manual calculation errors.

## Technology Stack

- **Frontend**: React with TypeScript
- **Form Management**: React Hook Form
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui


## Calculation Logic

Each work item uses a flexible formula system:

```
Value = (Quantity?) × (Hours?) × (Rate?)
```

- Check the box next to each field to include it in the calculation
- Unchecked fields are treated as 1 (neutral multiplier)
- If all boxes are unchecked, the value is 0

**Examples:**
- ✅ Quantity: 100 × ✅ Hours: 8 × ✅ Rate: 50 = **40,000 RON**
- ✅ Quantity: 5 × ❌ Hours: - × ✅ Rate: 200 = **1,000 RON**
- ❌ Quantity: - × ✅ Hours: 40 × ✅ Rate: 75 = **3,000 RON**

## Document Structure

The generated PDF includes:

1. **Header Section**: Company logo and multiple certification badges
2. **Project Information**: Beneficiary, construction site, period, contact details
3. **Work Items Table**: Detailed breakdown with all measurements and calculations
4. **Financial Summary**: 
   - Subtotal (before VAT)
   - VAT 21%
   - Grand Total
   - Remaining Payment
5. **Signature Section**: Director, Executor, Site Manager
6. **Optional Attachments**: Stamp/signature image

## Installation & Running

### Prerequisites

```bash
Node.js 16+ and npm
```

### Option 1: Run Locally (Development)

1. **Clone the repository:**
```bash
git clone [your-repository-url]
cd SituatiiDeLucrariGenerator
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser and navigate to:**
```
http://localhost:5173
```

### Option 2: Build for Production

1. **Build the project:**
```bash
npm run build
```

2. **Preview the production build:**
```bash
npm run preview
```

3. **Deploy the `dist` folder to your hosting service.**

## Usage Guide

### Step 1: Fill Basic Information
- Enter **Beneficiary** (client name)
- Enter **Construction Site** details
- Select **Period** (month and year)
- Optionally add **Subcontractor** information

### Step 2: Add Work Items
- Click **"Adaugă rând"** to add new work entries
- Fill in:
  - Work description
  - Unit of measurement (U.M.)
  - Total quantity
  - Hours worked
  - Rate per unit
- **Check the boxes** next to values you want to include in calculations

### Step 3: Attach Signature (Optional)
- Enable **"Include imagine la finalul PDF"**
- Upload your company stamp or signature image
- Preview appears before PDF generation

### Step 4: Generate PDF
- Review all calculations in the **live preview panel**
- Click **"Previzualizează PDF"** to see the document
- Click **"Descarcă PDF"** to download the final file


## Project Structure

```
src/
├── components/
│   ├── WorkSituationForm.tsx    # Main form component
│   ├── PdfPreview.tsx            # PDF generation logic
│   └── ui/                       # shadcn/ui components
├── types/
│   └── workSituation.ts          # TypeScript interfaces
├── fonts/
│   └── Roboto-Regular-normal.js  # Custom font with diacritics
└── public/
    └── [company logos]            # Branding assets
```

## License

MIT License - Feel free to use, modify, and distribute.

## Author

**Bota Andrei**

---

**Note**: This tool specifically addresses Romanian construction documentation requirements and includes Romanian language labels and terminology. Exchange rates and financial calculations should be verified with official sources for legal documentation.
