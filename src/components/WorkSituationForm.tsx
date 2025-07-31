import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkSituationData, defaultWorkItems, WorkItem, createEmptyWorkItem } from "@/types/workSituation";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Trash, Image } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

interface WorkSituationFormProps {
  onSubmit: (data: WorkSituationData) => void;
}

export const WorkSituationForm: React.FC<WorkSituationFormProps> = ({ onSubmit }) => {
  const [items, setItems] = useState<WorkItem[]>(defaultWorkItems);
  const [totalBeforeTax, setTotalBeforeTax] = useState(0);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasSubcontractor, setHasSubcontractor] = useState(false);

  // Pentru imagine PDF
  const [includeImage, setIncludeImage] = useState(false);
  const [footerImage, setFooterImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  const { register, handleSubmit, formState: { errors } } = useForm<Omit<WorkSituationData, 'items' | 'totalBeforeTax' | 'vat' | 'total' | 'remainingToPay'>>(); 
  
  // Calculează automat valorile pentru fiecare rând
  const updateItemValue = (index: number, field: keyof WorkItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === 'name' || field === 'unit' ? value : parseFloat(value) || 0 
    };
    
    // Calculează valoarea pentru luna curentă
    if (field === 'quantityThisMonth' || field === 'rate') {
      const qty = newItems[index].quantityThisMonth;
      const rate = newItems[index].rate;
      newItems[index].valueThisMonth = Number((qty * rate).toFixed(2));
    }
    
    setItems(newItems);
  };

  // Adaugă un rând nou
  const addRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, createEmptyWorkItem(newId)]);
  };
  
  // Șterge un rând
  const deleteRow = (id: number) => {
    const newItems = items.filter(item => item.id !== id);
    
    // Renumerotează ID-urile dacă se dorește
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      id: index + 1
    }));
    
    setItems(updatedItems);
  };
  
  // Calculează totalurile
  useEffect(() => {
    const sum = items.reduce((acc, item) => {
      return acc + item.valueThisMonth;
    }, 0);
    
    const totalBT = Number(sum.toFixed(2));
    setTotalBeforeTax(totalBT);
    
    const vatValue = Number((sum * 0.21).toFixed(2));
    setVat(vatValue);
    
    const totalValue = Number((sum + vatValue).toFixed(2));
    setTotal(totalValue);
  }, [items]);
  
  const onFormSubmit = (formData: any) => {
    if (!hasSubcontractor) {
      delete formData.subcontractor;
    }

    const finalData: WorkSituationData = {
      ...formData,
      items,
      totalBeforeTax,
      vat,
      total,
      remainingToPay: total,
      footerImage: includeImage ? footerImage : undefined
    };
    onSubmit(finalData);
  };

  // Funcție pentru a gestiona încărcarea imaginii
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFooterImage(result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(undefined);
      setFooterImage(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="beneficiary">Beneficiar</Label>
          <Input 
            id="beneficiary" 
            placeholder="Numele beneficiarului"
            {...register("beneficiary", { required: true })}
          />
          {errors.beneficiary && <p className="text-red-500 text-sm">Acest câmp este obligatoriu</p>}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSubcontractor"
              checked={hasSubcontractor}
              onCheckedChange={(checked) => setHasSubcontractor(!!checked)}
            />
            <Label htmlFor="hasSubcontractor">Include subantreprenor</Label>
          </div>

          {hasSubcontractor && (
            <>
              <Label htmlFor="subcontractor">Subantreprenor</Label>
              <Input
                id="subcontractor"
                placeholder="Numele subantreprenorului"
                {...register("subcontractor", { required: false })}
              />
            </>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="site">Șantier</Label>
          <Input 
            id="site" 
            placeholder="Numele șantierului"
            {...register("site", { required: true })}
          />
          {errors.site && <p className="text-red-500 text-sm">Acest câmp este obligatoriu</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="month">Luna</Label>
            <Input 
              id="month" 
              placeholder="ex: 1-30.05"
              {...register("month", { required: true })}
            />
            {errors.month && <p className="text-red-500 text-sm">Acest câmp este obligatoriu</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Anul</Label>
            <Input 
              id="year" 
              placeholder="ex: 2012"
              type="number"
              defaultValue={new Date().getFullYear()}
              {...register("year", { required: true })}
            />
            {errors.year && <p className="text-red-500 text-sm">Acest câmp este obligatoriu</p>}
          </div>
        </div>
        
        {/* Footer Image Section - Restructurat și îmbunătățit */}
        <div className="space-y-3 col-span-full">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeImage"
              checked={includeImage}
              onCheckedChange={(checked) => setIncludeImage(!!checked)}
            />
            <Label htmlFor="includeImage" className="flex items-center gap-2">
              <Image size={18} />
              Include imagine la finalul PDF
            </Label>
          </div>
          
          {includeImage && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="footerImage">Încarcă o imagine</Label>
                <Input
                  id="footerImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1"
                />
              </div>
              
              {imagePreview && (
                <div className="border p-2 rounded">
                  <p className="text-sm mb-2 text-gray-500">Previzualizare imagine:</p>
                  <img 
                    src={imagePreview} 
                    alt="Previzualizare imagine footer" 
                    className="max-h-20 object-contain" 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Situație de lucrări</h3>
          <Button 
            type="button" 
            onClick={addRow} 
            variant="outline"
            className="flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Adaugă rând
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full pdf-table">
            <TableHeader>
              <TableRow>
                <TableHead>Nr. Crt</TableHead>
                <TableHead>Denumire lucrari</TableHead>
                <TableHead>U.M.</TableHead>
                <TableHead>Cantitate totală</TableHead>
                <TableHead>Nr. Ore</TableHead>
                <TableHead>Tarif</TableHead>
                <TableHead>Valoare in luna</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItemValue(index, 'name', e.target.value)}
                      placeholder="Denumire lucrare"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItemValue(index, 'unit', e.target.value)}
                      placeholder="U.M."
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.totalQuantity}
                      onChange={(e) => updateItemValue(index, 'totalQuantity', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.quantityThisMonth}
                      onChange={(e) => updateItemValue(index, 'quantityThisMonth', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItemValue(index, 'rate', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>{item.valueThisMonth}</TableCell>
                  <TableCell>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteRow(item.id)}
                    >
                      <Trash size={16} className="text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="total-row">
                <TableCell colSpan={6} className="text-right">Total A</TableCell>
                <TableCell>{totalBeforeTax}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="total-row">
                <TableCell colSpan={6} className="text-right">TVA 21%</TableCell>
                <TableCell>{vat}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="total-row">
                <TableCell colSpan={6} className="text-right">Total general</TableCell>
                <TableCell>{total}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="total-row">
                <TableCell colSpan={6} className="text-right">Rest de plata</TableCell>
                <TableCell>{total}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="director">Director</Label>
          <Input 
            id="director" 
            placeholder="Nume director"
            {...register("director")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="executor">Executant</Label>
          <Input 
            id="executor" 
            placeholder="Nume executant"
            {...register("executor")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="siteManager">Șef lucrări</Label>
          <Input 
            id="siteManager" 
            placeholder="Nume șef lucrări"
            {...register("siteManager")}
          />
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button type="submit" className="px-8">
          Generează PDF
        </Button>
      </div>
    </form>
  );
};