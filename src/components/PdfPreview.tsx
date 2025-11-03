import React from "react";
import { Button } from "@/components/ui/button";
import { WorkSituationData } from "@/types/workSituation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Download, Image } from "lucide-react";
import { Card } from "./ui/card";

// Importă modulul generat pentru fontul Roboto cu diacritice
import '@/fonts/Roboto-Regular-normal.js';

interface PdfPreviewProps {
  data: WorkSituationData | null;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ data }) => {
  const [pdfPreview, setPdfPreview] = React.useState<string | null>(null);
  const generatePdf = (preview: boolean = false) => {
    if (!data) return;
    
    const doc = new jsPDF();

    // Selectează fontul importat (înregistrat în VFS de modul)
    doc.setFont("Roboto-Regular", "normal");

    // Configurare document
    doc.setFontSize(12);
    
    // Titluri principale în partea de sus a documentului
    doc.text("BENEFICIAR: " + data.beneficiary, 14, 20);
    if (data.subcontractor) {
      doc.text("SUBANTREPRENOR: " + data.subcontractor, 140, 20, { align: 'left' });
    }
    doc.text("ȘANTIER: " + data.site, 14, 25);
    
    // Titlul documentului
    doc.setFontSize(16);
    doc.text("Situație de lucrări", doc.internal.pageSize.width / 2, 40, { align: 'center' });
    
    // Luna și anul
    doc.setFontSize(12);
    doc.text("Luna " + data.month + "." + data.year, doc.internal.pageSize.width / 2, 50, { align: 'center' });
    
    // Tabelul cu lucrările
    autoTable(doc, {
      startY: 60,
      head: [['NR. CRT', 'DENUMIRE LUCRARI', 'U.M.', 'Cantitate totala', 'Nr. Ore', 'Tarif', 'Valoare (RON)']],
      body: [
        ...data.items.map(item => [
          item.id.toString(),
          item.name,
          item.unit,
          item.totalQuantity,
          item.quantityThisMonth,
          item.rate,
          item.valueThisMonth
        ]),
        ['', 'Total', '', '', '', '', data.totalBeforeTax + " RON"  ],
        ['', 'TVA 21%', '', '', '', '', data.vat + " RON"],
        ['', 'Total general', '', '', '', '', data.total + " RON"],
        ['', 'Rest de plata', '', '', '', '', data.remainingToPay + " RON"]
      ],
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: 'Roboto-Regular'
      },
      headStyles: {
        font: 'helvetica',     // sau 'Roboto-Regular' dacă ai un font bold separat
        fontStyle: 'bold',
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { cellWidth: 15 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 15 },
        6: { cellWidth: 25 }
      },
      theme: 'grid'
    });
    
    // TypeScript fix: Access finalY property safely
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    const margin = 20;
    
    // Semnături
    // Setează culoare de fundal verde și font bold pentru linia S.C.
    doc.setFillColor(26, 189, 156); // Specific green color
    // Desenează dreptunghi cu margine mai proeminentă
    doc.setLineWidth(0.5); // Grosimea marginii
    doc.setDrawColor(0, 0, 0); // Culoare margine neagră
    doc.rect(10, finalY + margin - 7, doc.internal.pageSize.width - 20, 10, 'FD'); // 'FD' înseamnă Fill and Draw
    
    // Setează culoare și font pentru linia S.C.
    doc.setTextColor(255, 255, 255); // Alb pentru S.C.
 
    doc.text(data.beneficiary, 14, finalY + margin, { maxWidth: doc.internal.pageSize.width - 30 });
    
    // Resetează culoarea și fontul pentru restul textului
    doc.setTextColor(0, 0, 0); // Negru pentru text normal
  
    doc.setFontSize(12);
    doc.text("Director:", 14, finalY + margin + 10);
  
    doc.setFontSize(10);
    doc.text(data.director || "", 14, finalY + margin + 20);
    
    if (data.subcontractor) {
      doc.text("SUBANTREPRENOR", 140, finalY + margin, { align: 'left' });
    }
    
    doc.setFontSize(12);
    doc.text("Executant:", 140, finalY + margin + 10, { align: 'left' });
   
    doc.setFontSize(10);
    doc.text(data.executor || "", 140, finalY + margin + 20, { align: 'left' });
    
    doc.setFontSize(12);
    doc.text("Șef lucrări:", 140, finalY + margin + 30, { align: 'left' });
 
    doc.setFontSize(10);
    doc.text(data.siteManager || "", 140, finalY + margin + 40, { align: 'left' });
    
    // Adaugă imaginea la finalul PDF dacă există
    if (data.footerImage) {
      try {
        // Calculează poziția imaginii sub semnături
        const imgY = finalY + margin + 55;
        // Lățimea maximă a imaginii (cu margini)
        const maxWidth = doc.internal.pageSize.width - 40;
        // Înălțimea maximă a imaginii (menține proporția)
        const maxHeight = 70;
        
        // Adaugă imaginea cu dimensiuni definite, păstrând proporția
        doc.addImage(data.footerImage, 'JPEG', 20, imgY - margin -10 , 30, 30, undefined, 'FAST', 0);
        
        // Adaugă o notă mică sub imagine
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        
      } catch (err) {
        console.error("Eroare la adăugarea imaginii în PDF:", err);
      }
    }

    // Salvare PDF
    const fileName = `Situatie_lucrari_${data.beneficiary}_${data.month}_${data.year}.pdf`;
    if (preview) {
      const pdfBlob = doc.output('blob');
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
          <h3 className="font-medium text-lg">Nicio previzualizare disponibilă</h3>
          <p className="text-muted-foreground">
            Completați formularul din stânga și apăsați "Generează PDF" pentru a vedea previzualizarea.
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
          <p><span className="font-medium">Beneficiar:</span> {data.beneficiary}</p>
          {data.subcontractor && <p><span className="font-medium">Subantreprenor:</span> {data.subcontractor}</p>}
          <p><span className="font-medium">Șantier:</span> {data.site}</p>
          <p><span className="font-medium">Perioada:</span> {data.month}.{data.year}</p>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold mb-2">Sumar financiar:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>Total lucrări:</div>
          <div className="font-medium text-right">{data.totalBeforeTax} RON</div>
          
          <div>TVA (19%):</div>
          <div className="font-medium text-right">{data.vat} RON</div>
          
          <div className="text-lg">Total general:</div>
          <div className="font-bold text-right text-lg">{data.total} RON</div>
          
          <div>Rest de plată:</div>
          <div className="font-medium text-right">{data.remainingToPay} RON</div>
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
        <h3 className="font-bold mb-2">Rânduri în situația de lucrări: {data.items.length}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NR. CRT</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DENUMIRE LUCRĂRI</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VALOARE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{item.id}</td>
                  <td className="px-3 py-2 text-sm">{item.name}</td>
                  <td className="px-3 py-2 text-sm">{item.valueThisMonth} RON</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-center pt-4 space-x-4">
        <Button className="flex items-center space-x-2" variant="outline" onClick={() => generatePdf(true)}>
          <FileText size={16} />
          <span>Previzualizează PDF</span>
        </Button>
        <Button className="flex items-center space-x-2" onClick={() => generatePdf()}>
          <Download size={16} />
          <span>Descarcă PDF</span>
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