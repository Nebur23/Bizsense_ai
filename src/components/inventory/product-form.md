"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createProduct } from "@/actions/inventory/Products";

// Cameroon-specific units
const CAMEROON_UNITS = [
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "g", label: "Gramme (g)" },
  { value: "l", label: "Litre (l)" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "pcs", label: "Pièces" },
  { value: "carton", label: "Carton" },
  { value: "sac", label: "Sac" },
  { value: "botte", label: "Botte" },
  { value: "paquet", label: "Paquet" },
  { value: "m", label: "Mètre (m)" },
  { value: "cm", label: "Centimètre (cm)" },
];

interface ProductFormProps {
  categories: Array<{ id: string; categoryName: string }>;
  onSuccess?: () => void;
}

export function ProductForm({
  categories,
  onSuccess,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    productCode: "",
    costPrice: 0,
    sellingPrice: 0,
    unitOfMeasure: "",
    reorderLevel: 0,
    maxStockLevel: 0,
    trackInventory: true,
    hasVariants: false,
    barcode: "",
    expiryTracking: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProduct({ ...formData });
      toast.success("Produit créé avec succès");
      onSuccess?.();
      // Reset form
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        productCode: "",
        costPrice: 0,
        sellingPrice: 0,
        unitOfMeasure: "",
        reorderLevel: 0,
        maxStockLevel: 0,
        trackInventory: true,
        hasVariants: false,
        barcode: "",
        expiryTracking: false,
      });
    } catch (error) {
      toast.error("Erreur lors de la création du produit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau Produit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='name'>Nom du Produit *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='productCode'>Code Produit *</Label>
              <Input
                id='productCode'
                value={formData.productCode}
                onChange={e =>
                  setFormData({ ...formData, productCode: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='categoryId'>Catégorie</Label>
              <Select
                value={formData.categoryId}
                onValueChange={value =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sélectionner une catégorie' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='unitOfMeasure'>Unité de Mesure *</Label>
              <Select
                value={formData.unitOfMeasure}
                onValueChange={value =>
                  setFormData({ ...formData, unitOfMeasure: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sélectionner une unité' />
                </SelectTrigger>
                <SelectContent>
                  {CAMEROON_UNITS.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='costPrice'>Prix de Revient (FCFA)</Label>
              <Input
                id='costPrice'
                type='number'
                value={formData.costPrice}
                onChange={e =>
                  setFormData({
                    ...formData,
                    costPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor='sellingPrice'>Prix de Vente (FCFA) *</Label>
              <Input
                id='sellingPrice'
                type='number'
                value={formData.sellingPrice}
                onChange={e =>
                  setFormData({
                    ...formData,
                    sellingPrice: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor='reorderLevel'>Seuil de Réapprovisionnement</Label>
              <Input
                id='reorderLevel'
                type='number'
                value={formData.reorderLevel}
                onChange={e =>
                  setFormData({
                    ...formData,
                    reorderLevel: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor='maxStockLevel'>Stock Maximum</Label>
              <Input
                id='maxStockLevel'
                type='number'
                value={formData.maxStockLevel}
                onChange={e =>
                  setFormData({
                    ...formData,
                    maxStockLevel: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor='barcode'>Code-Barres</Label>
              <Input
                id='barcode'
                value={formData.barcode}
                onChange={e =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                placeholder='Scanner ou saisir manuellement'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className='flex flex-col space-y-4'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='trackInventory'
                checked={formData.trackInventory}
                onCheckedChange={checked =>
                  setFormData({ ...formData, trackInventory: checked })
                }
              />
              <Label htmlFor='trackInventory'>Suivre l'inventaire</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='hasVariants'
                checked={formData.hasVariants}
                onCheckedChange={checked =>
                  setFormData({ ...formData, hasVariants: checked })
                }
              />
              <Label htmlFor='hasVariants'>Produit avec variantes</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='expiryTracking'
                checked={formData.expiryTracking}
                onCheckedChange={checked =>
                  setFormData({ ...formData, expiryTracking: checked })
                }
              />
              <Label htmlFor='expiryTracking'>
                Suivi des dates d'expiration
              </Label>
            </div>
          </div>

          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? "Création..." : "Créer le Produit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
