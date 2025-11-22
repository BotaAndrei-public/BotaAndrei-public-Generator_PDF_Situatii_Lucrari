import React from "react";
import { Button } from "@/components/ui/button";
import { WorkSituationData } from "@/types/workSituation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Download, Image } from "lucide-react";
import { Card } from "./ui/card";
import logo from "../../public/BULETIN DE MASURARE_26 ELECON PLUS_html_18108ea4.png";
import sigla1 from "../../public/BULETIN DE MASURARE_26 ELECON PLUS_html_e73e1303.png";
import sigla2 from "../../public/BULETIN DE MASURARE_26 ELECON PLUS_html_3e6d2efa.png";
import sigla3 from "../../public/BULETIN DE MASURARE_26 ELECON PLUS_html_440b173a.png";
// Importă modulul generat pentru fontul Roboto cu diacritice
import "@/fonts/Roboto-Regular-normal.js";
import { set } from "date-fns";

interface PdfPreviewProps {
  data: WorkSituationData | null;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ data }) => {
  const [pdfPreview, setPdfPreview] = React.useState<string | null>(null);
  const [color, setColor] = React.useState("#d6d6d6"); // culoare default
  const [PDF_txt_color, setPDF_txt_color] = React.useState("#000000"); // culoare default
  const [ecoMode, setEcoMode] = React.useState(true);

  const setEco = (ecoMode) => {
    if (ecoMode == true) {
      setColor("#0066ff");
      setPDF_txt_color("#ffffff");
      setEcoMode(false);
      
    } else {
      setColor("#d6d6d6");
      
      setPDF_txt_color("#000000");
      setEcoMode(true);
    }
  };

  const generatePdf = (preview: boolean = false) => {
    
    if (!data) return;

    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.replace("#", ""), 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    };

    const lightenColor = (hex: string, amount: number) => {
      const bigint = parseInt(hex.replace("#", ""), 16);
      let r = (bigint >> 16) & 255;
      let g = (bigint >> 8) & 255;
      let b = bigint & 255;

      // creștem fiecare canal spre alb (255)
      r = Math.min(r + amount, 255);
      g = Math.min(g + amount, 255);
      b = Math.min(b + amount, 255);

      return { r, g, b };
    };

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = 200;
    const colorUP = 10;
    const { r: colorR, g: colorG, b: colorB } = lightenColor(color, colorUP);

    // Logo firmă
    let y = 25;
    let logo_ratio = 1.66;
    let x = logo_ratio * y;
    let imgData = logo;
    doc.addImage(imgData, "PNG", 14, 10, x, y);

    // Sigla1
    y = 18;
    logo_ratio = 1;
    x = logo_ratio * y;
    imgData = sigla1;
    doc.addImage(imgData, "PNG", 130, 10, x, y);

    // Sigla2
    y = 18;
    logo_ratio = 2;
    x = logo_ratio * y;
    imgData = sigla2;
    doc.addImage(imgData, "PNG", 145, 10, x, y);

    // Sigla3
    y = 18;
    logo_ratio = 1.1;
    x = logo_ratio * y;
    imgData = sigla3;
    doc.addImage(imgData, "PNG", 180, 10, x, y);

    // Selectează fontul importat
    doc.setFont("Roboto-Regular", "normal");

    // Configurare document
    doc.setFontSize(12);

    // Titluri principale

    let localSpace = 2;
    doc.text("Email: electrograndserv@gmail.com", 14, 45);
    doc.text("Telefon: +40 744 290 613", 14, 50);
    doc.setLineWidth(0.5);
    doc.setDrawColor(colorR, colorG, colorB); // albastru frumos (#0066FF)
    doc.line(14, 50 + localSpace, 200, 50 + localSpace); // x1, y1, x2, y2 (linie de la stânga la dreapta)
    doc.text("BENEFICIAR: " + data.beneficiary, 14, 55 + localSpace);
    doc.text("ȘANTIER: " + data.site, 14, 60 + localSpace);

    if (data.subcontractor) {
      doc.text("SUBANTREPRENOR: " + data.subcontractor, 14, 65);
    }

    // Titlul documentului
    doc.setFontSize(16);
    doc.text("Situație de lucrări", pageWidth / 2, 30, { align: "center" });

    // Luna și anul
    doc.setFontSize(12);
    doc.text("Data: " + data.month + "." + data.year, pageWidth / 2, 35, {
      align: "center",
    });

    doc.setFillColor(31, 67, 101);
    // Tabelul cu lucrările - autoTable gestionează automat paginile noi
    autoTable(doc, {
      startY: 65,

      head: [
        [
          "NR. CRT",
          "DENUMIRE LUCRARI",
          "U.M.",
          "Cantitate totala",
          "Nr. Ore",
          "Tarif",
          "Valoare (RON)",
        ],
      ],
      body: [
        ...data.items.map((item) => [
          item.id.toString(),
          item.name,
          item.unit,
          item.totalQuantity,
          item.quantityThisMonth,
          item.rate,
          item.valueThisMonth,
        ]),
        ["", "Total", "", "", "", "", data.totalBeforeTax + " RON"],
        ["", "TVA 21%", "", "", "", "", data.vat + " RON"],
        ["", "Total general", "", "", "", "", data.total + " RON"],
        ["", "Rest de plată", "", "", "", "", data.remainingToPay + " RON"],
      ],
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: "Roboto-Regular",
      },
      headStyles: {
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 10,
        textColor: PDF_txt_color,
        fillColor: [colorR, colorG, colorB], // albastru
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 61 },
        2: { cellWidth: 15 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 15 },
        6: { cellWidth: 30 },
      },
      theme: "grid",
      // Această opțiune face ca tabelul să continue automat pe pagina următoare
      showHead: "everyPage",
      margin: { top: 10, bottom: 10 }, // Marjă redusă pentru a maximiza spațiul
    });

    // Obține poziția finală a tabelului
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    const margin = 15;
    const signatureHeight = 55; // Înălțimea necesară pentru semnături
    const imageHeight = data.footerImage ? 35 : 0;
    const totalNeededSpace = signatureHeight + imageHeight;

    // Verifică dacă TOATĂ secțiunea de semnături încape pe pagina curentă
    // Dacă nu încape deloc, mută totul pe pagina nouă
    if (finalY + margin + totalNeededSpace > pageHeight - 10) {
      // Adaugă o pagină nouă pentru semnături
      doc.addPage();

      // Desenează headerul și pe pagina nouă
      doc.setFontSize(12);
      if (data.subcontractor) {
        doc.text("SUBANTREPRENOR: " + data.subcontractor, 140, 20, {
          align: "left",
        });
      }

      // Setează poziția pentru semnături la începutul paginii noi
      const newPageY = 30;

      // Dreptunghi verde pentru beneficiar
      doc.setFillColor(colorR, colorG, colorB);
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.rect(14, newPageY - 7, pageWidth-14, 10, "F");

      doc.setTextColor(PDF_txt_color);
      doc.text(data.beneficiary, 16, newPageY, { maxWidth: pageWidth - 14 });

      //  doc.setFillColor(colorR, colorG, colorB);
      //   //doc.setLineWidth(0);
      //   doc.setDrawColor(0, 0, 0);
      //   doc.rect(14, finalY + margin - 7, pageWidth - 35, 10, "F");

      //   doc.setTextColor(255, 255, 255);
      //   doc.text(data.beneficiary, 16, finalY + margin, {
      //     maxWidth: pageWidth - 35,
      //   });

      //       doc.setFillColor(colorR, colorG, colorB);
      // //doc.setLineWidth(0);
      // doc.setDrawColor(0, 0, 0);
      // doc.rect(14, finalY + margin - 7, pageWidth - 14, 10, "F");

      // doc.setTextColor(PDF_txt_color);
      // doc.text(data.beneficiary, 16, finalY + margin, {
      //   maxWidth: pageWidth - 14,
      // });

      doc.setTextColor(PDF_txt_color);
      doc.setFontSize(12);
      doc.text("Director:", 14, newPageY + 10);
      doc.setFontSize(10);
      doc.text(data.director || "", 14, newPageY + 20);

      if (data.subcontractor) {
        doc.setFontSize(12);
        doc.text("SUBANTREPRENOR", 140, newPageY, { align: "left" });
      }

      doc.setFontSize(12);
      doc.text("Executant:", 140, newPageY + 10, { align: "left" });
      doc.setFontSize(10);
      doc.text(data.executor || "", 140, newPageY + 20, { align: "left" });

      doc.setFontSize(12);
      doc.text("Șef lucrări:", 140, newPageY + 30, { align: "left" });
      doc.setFontSize(10);
      doc.text(data.siteManager || "", 140, newPageY + 40, { align: "left" });

      // Imaginea pe pagina nouă
      if (data.footerImage) {
        try {
          const imgY = newPageY + 50;
          doc.addImage(
            data.footerImage,
            "JPEG",
            20,
            imgY,
            30,
            30,
            undefined,
            "FAST",
            0
          );
        } catch (err) {
          console.error("Eroare la adăugarea imaginii în PDF:", err);
        }
      }
    } else {
      // Semnături pe aceeași pagină
      doc.setFillColor(colorR, colorG, colorB);
      //doc.setLineWidth(0);
      doc.setDrawColor(0, 0, 0);
      doc.rect(14, finalY + margin - 7, pageWidth - 14, 10, "F");

      doc.setTextColor(PDF_txt_color);
      doc.text(data.beneficiary, 16, finalY + margin, {
        maxWidth: pageWidth - 14,
      });

      //Difereta text jos pg
      const difEl = -4;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text("Director:", 14, finalY + margin + 10);
      doc.setFontSize(10);
      doc.text(data.director || "", 14, finalY + margin + 20 + difEl);

      if (data.subcontractor) {
        doc.setFontSize(12);
        doc.text("SUBANTREPRENOR", 140, finalY + margin, { align: "left" });
      }

      doc.setFontSize(12);
      doc.text("Executant:", 140, finalY + margin + 10, { align: "left" });
      doc.setFontSize(10);
      doc.text(data.executor || "", 140, finalY + margin + 20 + difEl, {
        align: "left",
      });

      doc.setFontSize(12);
      doc.text("Șef lucrări:", 140, finalY + margin + 30, { align: "left" });
      doc.setFontSize(10);
      doc.text(data.siteManager || "", 140, finalY + margin + 40 + difEl, {
        align: "left",
      });

      // Imaginea
      if (data.footerImage) {
        try {
          const imgY = finalY + margin + 55;
          doc.addImage(
            data.footerImage,
            "JPEG",
            20,
            imgY - margin - 10,
            48.5,
            48.5,
            undefined,
            "FAST",
            0
          );
        } catch (err) {
          console.error("Eroare la adăugarea imaginii în PDF:", err);
        }
      }
    }

    // Salvare PDF
    const fileName = `Situatie_lucrari_${data.beneficiary}_${data.month}_${data.year}.pdf`;
    if (preview) {
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreview(pdfUrl);
    } else {
      doc.save(fileName);
    }
  };

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-8 text-center">
        <FileText size={64} className="text-muted-foreground" />
        <div>
          <h3 className="font-medium text-lg">
            Nicio previzualizare disponibilă
          </h3>
          <p className="text-muted-foreground">
            Completați formularul din stânga și apăsați "Generează PDF" pentru a
            vedea previzualizarea.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gray-50">
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Date situație de lucrări:</h3>
          <p>
            <span className="font-medium">Beneficiar:</span> {data.beneficiary}
          </p>
          {data.subcontractor && (
            <p>
              <span className="font-medium">Subantreprenor:</span>{" "}
              {data.subcontractor}
            </p>
          )}
          <p>
            <span className="font-medium">Șantier:</span> {data.site}
          </p>
          <p>
            <span className="font-medium">Perioada:</span> {data.month}.
            {data.year}
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold mb-2">Sumar financiar:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>Total lucrări:</div>
          <div className="font-medium text-right">
            {data.totalBeforeTax} RON
          </div>

          <div>TVA (21%):</div>
          <div className="font-medium text-right">{data.vat} RON</div>

          <div className="text-lg">Total general:</div>
          <div className="font-bold text-right text-lg">{data.total} RON</div>

          <div>Rest de plată:</div>
          <div className="font-medium text-right">
            {data.remainingToPay} RON
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold mb-2">Semnături:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Director:</p>
            <p>{data.director || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium">Executant:</p>
            <p>{data.executor || "N/A"}</p>
            <p className="font-medium mt-2">Șef lucrări:</p>
            <p>{data.siteManager || "N/A"}</p>
          </div>
        </div>
      </Card>

      {data.footerImage && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Image size={16} />
            <h3 className="font-bold">Imagine atașată:</h3>
          </div>
          <div className="flex justify-center border rounded p-2 bg-gray-50">
            <img
              src={data.footerImage}
              alt="Imagine atașată pentru PDF"
              className="max-h-32 object-contain"
            />
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-bold mb-2">
          Rânduri în situația de lucrări: {data.items.length}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NR. CRT
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DENUMIRE LUCRĂRI
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VALOARE
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {item.id}
                  </td>
                  <td className="px-3 py-2 text-sm">{item.name}</td>
                  <td className="px-3 py-2 text-sm">
                    {item.valueThisMonth} RON
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-center pt-4 space-x-4">
        <Button
          className="flex items-center space-x-2"
          variant="outline"
          onClick={() => generatePdf(true)}
        >
          <FileText size={16} />
          <span>Previzualizează PDF</span>
        </Button>
        <Button
          className="flex items-center space-x-2"
          onClick={() => generatePdf()}
        >
          <Download size={16} />
          <span>Descarcă PDF</span>
        </Button>

        {/* //pickColor */}
        <div className="relative">
          <div
            onClick={() => document.getElementById("color-picker")?.click()}
            className="w-10 h-10 rounded-full border-[1px] border-black cursor-pointer"
            style={{ backgroundColor: color }}
          />
          <input
            id="color-picker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="absolute opacity-0 w-0 h-0"
          />
        </div>
        <Button
          className={`${
            ecoMode ? "bg-emerald-400" : "bg-slate-100"
          } font-bold text-shadow `}
          onClick={() => setEco(ecoMode)}
        >
          {" "}
          Eco mode{" "}
          <span
            className={`${
              ecoMode ? "text-white" : "text-red-500"
            } font-bold text-shadow `}
            onClick={() => setEco(ecoMode)}
          >
            {ecoMode ? "ON" : "OFF"}
          </span>{" "}
          <span
            className={`${
              ecoMode ? "bg-black" : "bg-blue-500"
            } p-1 rounded-full`}
          >
            {" "}
            {ecoMode ? "♻️" : "⚡"}
          </span>
        </Button>
      </div>
      {pdfPreview && (
        <div className="mt-4 w-full h-[600px] border">
          <iframe
            src={pdfPreview}
            width="100%"
            height="100%"
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
};

export default PdfPreview;
