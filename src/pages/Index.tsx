
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkSituationForm } from "@/components/WorkSituationForm";
import PdfPreview from "@/components/PdfPreview";
import { WorkSituationData } from "@/types/workSituation";

const Index = () => {
  const [workSituationData, setWorkSituationData] = useState<WorkSituationData | null>(null);

  const handleFormSubmit = (data: WorkSituationData) => {
    setWorkSituationData(data);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Generator PDF - Situații de Lucrări</h1>
      
      <div className="flex flex-col gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Date Situație de Lucrări</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkSituationForm onSubmit={handleFormSubmit} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Previzualizare și Export PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <PdfPreview data={workSituationData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
