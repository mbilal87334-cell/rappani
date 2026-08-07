import React, { useState, useRef } from 'react';
import { Search, Plus, Eye, EyeOff, Edit2, Trash2, Copy, Image as ImageIcon, X, Upload, Download, Camera, Loader } from 'lucide-react';
import { Product, saveProduct, deleteProduct } from '../../App';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '../../api';

export default function ProductManager({ products, setProducts, apiCategories = [] }: { products: Product[], setProducts: any, apiCategories?: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '', name: '', category: '', brand: '', sku: '', description: '', price: 0, originalPrice: 0, stock: 50, image: '', images: [], isVisible: true, isFeatured: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [selectedCsvImages, setSelectedCsvImages] = useState<FileList | null>(null);
  const [isCsvImporting, setIsCsvImporting] = useState(false);
  const [csvImportProgress, setCsvImportProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const csvImagesInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const tabs = ['All', ...apiCategories.map(c => c.name)];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || p.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const openModal = (product?: Product, isCopy = false) => {
    if (product) {
      if (isCopy) {
        setEditingProduct(null);
        setFormData({ ...product, id: `prod_${Date.now()}`, name: `${product.name} (Copy)` });
      } else {
        setEditingProduct(product);
        setFormData({ ...product });
      }
    } else {
      setEditingProduct(null);
      setFormData({ 
        id: `prod_${Date.now()}`, name: '', category: apiCategories[0]?.name || 'Stationery', brand: '', sku: '', description: '',
        price: 0, stock: 50, image: '', images: [], isVisible: true, isFeatured: false 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await saveProduct(formData as Product, !!editingProduct);
      if (editingProduct) {
        setProducts(products.map(p => p.id === saved.id ? saved : p));
        toast.success("Product updated successfully");
        // Keep modal open so they can continue editing
      } else {
        setProducts([saved, ...products]);
        toast.success("Product created successfully");
        // Reset form for the next product to be added
        setFormData({ 
          id: `prod_${Date.now()}`, name: '', category: formData.category || apiCategories[0]?.name || 'Stationery', brand: '', sku: '', description: '',
          price: 0, deliveryCharge: 30, stock: 50, image: '', images: [], isVisible: true, isFeatured: false 
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      // If multiple files are uploaded (drag&drop or multi-select)
      if (files.length > 1) {
        let uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const formDataPayload = new FormData();
          formDataPayload.append('image', files[i]);
          const res = await fetchWithAuth('/api/upload', { method: 'POST', body: formDataPayload });
          const data = await res.json();
          if (data.imageUrl) uploadedUrls.push(data.imageUrl);
        }
        
        const existingImages = formData.images || [];
        if (!formData.image && uploadedUrls.length > 0) {
          setFormData({ ...formData, image: uploadedUrls[0], images: [...existingImages, ...uploadedUrls] });
        } else {
          setFormData({ ...formData, images: [...existingImages, ...uploadedUrls] });
        }
        toast.success(`${uploadedUrls.length} images uploaded!`);
      } else {
        // Single file upload
        const formDataPayload = new FormData();
        formDataPayload.append('image', files[0]);
        const res = await fetchWithAuth('/api/upload', { method: 'POST', body: formDataPayload });
        const data = await res.json();
        
        if (data.imageUrl) {
          const existingImages = formData.images || [];
          setFormData({ 
            ...formData, 
            image: formData.image ? formData.image : data.imageUrl,
            images: [...existingImages, data.imageUrl]
          });
          toast.success("Image uploaded!");
        } else {
          toast.error(data.error || "Upload failed");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    
    // If the removed image was the primary image, set a new primary if available
    let newPrimary = formData.image;
    if (formData.image === (formData.images || [])[index]) {
      newPrimary = newImages.length > 0 ? newImages[0] : '';
    }
    
    setFormData({ ...formData, images: newImages, image: newPrimary });
  };

  const handleDelete = async (product: any) => {
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;
    try {
      const targetId = product.id || product._id;
      await deleteProduct(targetId);
      setProducts((prev: Product[]) => prev.filter((p: any) => (p.id || p._id) !== targetId));
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    const updated = { ...product, isVisible: product.isVisible === false ? true : false };
    try {
      await saveProduct(updated, true);
      setProducts((prev: Product[]) => prev.map(p => p.id === product.id ? updated : p));
      toast.success(updated.isVisible ? "Product is now visible" : "Product hidden from store");
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const handleToggleFeatured = async (product: Product, isFeatured: boolean) => {
    const updated = { ...product, isFeatured };
    try {
      await saveProduct(updated, true);
      setProducts((prev: Product[]) => prev.map(p => p.id === product.id ? updated : p));
      toast.success(updated.isFeatured ? "Added to Hero Slider" : "Removed from Hero Slider");
    } catch (err) {
      toast.error("Failed to update featured status");
    }
  };

  
  const handleExportCSV = () => {
    try {
      const headers = ['id', 'name', 'category', 'price', 'originalPrice', 'deliveryCharge', 'stock', 'isVisible', 'isFeatured', 'image', 'images', 'videoUrl', 'brand', 'sku', 'description'];
      
      const rows = products.map(p => {
        return [
          p.id || '',
          `"${(p.name || '').replace(/"/g, '""')}"`,
          `"${(p.category || '').replace(/"/g, '""')}"`,
          p.price || 0,
          p.originalPrice || '',
          p.deliveryCharge || 30,
          p.stock || 0,
          p.isVisible !== false ? 'true' : 'false',
          p.isFeatured ? 'true' : 'false',
          `"${(p.image || '').replace(/"/g, '""')}"`,
          `"${(p.images?.join(';') || '').replace(/"/g, '""')}"`,
          `"${(p.videoUrl || '').replace(/"/g, '""')}"`,
          `"${(p.brand || '').replace(/"/g, '""')}"`,
          `"${(p.sku || '').replace(/"/g, '""')}"`,
          `"${(p.description || '').replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = headers.join(',') + '\n' + rows.join('\n');
      
      // UTF-8 BOM for Excel to read Unicode characters properly (like Tamil)
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Products exported successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export CSV');
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return toast.error('CSV is empty or missing headers');
        
        // Robust CSV parser supporting quotes and inner commas
        const parseCSVRow = (rowText: string): string[] => {
          const result: string[] = [];
          let currentField = '';
          let inQuotes = false;
          
          for (let i = 0; i < rowText.length; i++) {
            const char = rowText[i];
            const nextChar = rowText[i+1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(currentField.trim());
              currentField = '';
            } else {
              currentField += char;
            }
          }
          result.push(currentField.trim());
          return result;
        };

        const headerRow = parseCSVRow(lines[0]);
        const headerMap: { [key: string]: number } = {};
        
        headerRow.forEach((h, idx) => {
          const cleanHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (['name', 'productname', 'title', 'itemname', 'product'].includes(cleanHeader)) {
            headerMap['name'] = idx;
          } else if (['category', 'type', 'group'].includes(cleanHeader)) {
            headerMap['category'] = idx;
          } else if (['price', 'rate', 'salesprice', 'amount'].includes(cleanHeader)) {
            headerMap['price'] = idx;
          } else if (['originalprice', 'mrp', 'costprice'].includes(cleanHeader)) {
            headerMap['originalPrice'] = idx;
          } else if (['deliverycharge', 'shippingcharge', 'delivery'].includes(cleanHeader)) {
            headerMap['deliveryCharge'] = idx;
          } else if (['stock', 'quantity', 'qty', 'stockcount'].includes(cleanHeader)) {
            headerMap['stock'] = idx;
          } else if (['image', 'imageurl', 'photo', 'picture'].includes(cleanHeader)) {
            headerMap['image'] = idx;
          } else if (['brand'].includes(cleanHeader)) {
            headerMap['brand'] = idx;
          } else if (['description', 'desc'].includes(cleanHeader)) {
            headerMap['description'] = idx;
          }
        });

        if (headerMap['name'] === undefined) {
          return toast.error("Could not find 'Name' or 'Product' column in CSV headers");
        }
        if (headerMap['price'] === undefined) {
          return toast.error("Could not find 'Price' or 'Rate' column in CSV headers");
        }

        const newProducts: Product[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVRow(lines[i]);
          if (values.length === 0 || !values[headerMap['name']]) continue;
          
          const nameVal = values[headerMap['name']];
          const priceVal = parseFloat(values[headerMap['price']]) || 0;
          const originalPriceVal = headerMap['originalPrice'] !== undefined ? (parseFloat(values[headerMap['originalPrice']]) || undefined) : undefined;
          const deliveryVal = headerMap['deliveryCharge'] !== undefined ? (parseFloat(values[headerMap['deliveryCharge']]) || 0) : 0;
          const stockVal = headerMap['stock'] !== undefined ? (parseInt(values[headerMap['stock']]) || 0) : 50;
          const categoryVal = headerMap['category'] !== undefined ? (values[headerMap['category']] || 'Uncategorized') : 'Uncategorized';
          const imageVal = (headerMap['image'] !== undefined && values[headerMap['image']]) 
            ? values[headerMap['image']] 
            : `https://placehold.co/600x600/f3f4f6/9ca3af?text=${encodeURIComponent(nameVal)}`;
          const brandVal = headerMap['brand'] !== undefined ? (values[headerMap['brand']] || '') : '';
          const descVal = headerMap['description'] !== undefined ? (values[headerMap['description']] || '') : '';

          const newProduct: Product = {
            id: `prod_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
            name: nameVal,
            category: categoryVal,
            price: priceVal,
            originalPrice: originalPriceVal,
            deliveryCharge: deliveryVal,
            stock: stockVal,
            image: imageVal,
            brand: brandVal,
            description: descVal,
            isVisible: true,
            isFeatured: false
          };
          newProducts.push(newProduct);
        }

        if (newProducts.length === 0) {
          return toast.error('No valid products found in CSV');
        }
        
        toast.loading(`Importing ${newProducts.length} products...`, { id: 'bulkUpload' });
        
        const res = await fetchWithAuth('/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProducts),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to bulk save products");
        }

        // Refresh products list
        const prodRes = await fetchWithAuth('/api/products/all');
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.products || data);
        }

        toast.success(`Successfully imported ${newProducts.length} products!`, { id: 'bulkUpload' });
      } catch (err: any) {
        toast.error(`Failed to parse/import CSV: ${err.message || err}`, { id: 'bulkUpload' });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const handleCsvImportSubmit = async () => {
    if (!selectedCsvFile) {
      return toast.error("Please select a CSV file first");
    }
    
    setIsCsvImporting(true);
    toast.loading('Processing CSV & images...', { id: 'csvImport' });
    
    try {
      const loadSheetJS = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          if ((window as any).XLSX) {
            resolve((window as any).XLSX);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
          script.onload = () => resolve((window as any).XLSX);
          script.onerror = (err) => reject(err);
          document.body.appendChild(script);
        });
      };

      let headerRow: string[] = [];
      let dataRows: string[][] = [];

      if (selectedCsvFile.name.endsWith('.xlsx') || selectedCsvFile.name.endsWith('.xls')) {
        setCsvImportProgress('Loading Excel parser...');
        const XLSX = await loadSheetJS();
        setCsvImportProgress('Reading Excel file...');
        const buffer = await selectedCsvFile.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (rows.length < 1) {
          throw new Error('Excel sheet is empty');
        }
        
        const stringRows = rows.map(r => r.map(cell => cell !== undefined && cell !== null ? String(cell).trim() : ''));
        headerRow = stringRows[0];
        dataRows = stringRows;
      } else {
        setCsvImportProgress('Reading CSV file...');
        const text = await selectedCsvFile.text();
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        if (lines.length < 1) {
          throw new Error('CSV is empty');
        }

        const parseCSVRow = (rowText: string): string[] => {
          const result: string[] = [];
          let currentField = '';
          let inQuotes = false;
          
          for (let i = 0; i < rowText.length; i++) {
            const char = rowText[i];
            const nextChar = rowText[i+1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(currentField.trim());
              currentField = '';
            } else {
              currentField += char;
            }
          }
          result.push(currentField.trim());
          return result;
        };

        headerRow = parseCSVRow(lines[0]);
        dataRows = lines.map(line => parseCSVRow(line));
      }
      let isHeaderRow = false;
      const headerMap: { [key: string]: number } = {};
      
      headerRow.forEach((h, idx) => {
        const cleanHeader = h.toLowerCase().trim();
        const validHeaders = [
          'name', 'productname', 'title', 'itemname', 'product', 'category', 'type', 'group', 
          'price', 'rate', 'salesprice', 'amount', 'stock', 'quantity', 'qty', 'stockcount', 
          'image', 'imageurl', 'photo', 'picture', 'filename', 'brand', 'description', 'desc',
          'பெயர்', 'பெயர்கள்', 'தயாரிப்பு', 'விலை', 'விற்பனை விலை', 'மதிப்பு', 'பிரிவு', 'வகை',
          'இருப்பு', 'அளவு', 'படம்', 'புகைப்படம்', 'படம் பெயர்', 'விளக்கம்', 'விவரம்'
        ];
        
        if (validHeaders.some(vh => cleanHeader.includes(vh) || vh.includes(cleanHeader))) {
          isHeaderRow = true;
        }

        if (['name', 'productname', 'title', 'itemname', 'product', 'பெயர்', 'பெயர்கள்', 'தயாரிப்பு'].some(x => cleanHeader.includes(x))) {
          headerMap['name'] = idx;
        } else if (['category', 'type', 'group', 'பிரிவு', 'வகை'].some(x => cleanHeader.includes(x))) {
          headerMap['category'] = idx;
        } else if (['price', 'rate', 'salesprice', 'amount', 'விலை', 'விற்பனை விலை', 'மதிப்பு'].some(x => cleanHeader.includes(x))) {
          headerMap['price'] = idx;
        } else if (['originalprice', 'mrp', 'costprice'].some(x => cleanHeader.includes(x))) {
          headerMap['originalPrice'] = idx;
        } else if (['deliverycharge', 'shippingcharge', 'delivery'].some(x => cleanHeader.includes(x))) {
          headerMap['deliveryCharge'] = idx;
        } else if (['stock', 'quantity', 'qty', 'stockcount', 'இருப்பு', 'அளவு'].some(x => cleanHeader.includes(x))) {
          headerMap['stock'] = idx;
        } else if (['image', 'imageurl', 'photo', 'picture', 'filename', 'படம்', 'புகைப்படம்', 'படம் பெயர்'].some(x => cleanHeader.includes(x))) {
          headerMap['image'] = idx;
        } else if (['brand'].some(x => cleanHeader.includes(x))) {
          headerMap['brand'] = idx;
        } else if (['description', 'desc', 'விளக்கம்', 'விவரம்'].some(x => cleanHeader.includes(x))) {
          headerMap['description'] = idx;
        }
      });

      // Default index-based mapping fallbacks if headers don't match or are missing
      const nameIdx = headerMap['name'] !== undefined ? headerMap['name'] : 0;
      const priceIdx = headerMap['price'] !== undefined ? headerMap['price'] : 2;
      const categoryIdx = headerMap['category'] !== undefined ? headerMap['category'] : 1;
      const originalPriceIdx = headerMap['originalPrice'] !== undefined ? headerMap['originalPrice'] : 3;
      const stockIdx = headerMap['stock'] !== undefined ? headerMap['stock'] : 4;
      let imageIdx = headerMap['image'] !== undefined ? headerMap['image'] : -1;
      const brandIdx = headerMap['brand'] !== undefined ? headerMap['brand'] : 6;
      const descIdx = headerMap['description'] !== undefined ? headerMap['description'] : 7;
      const deliveryChargeIdx = headerMap['deliveryCharge'] !== undefined ? headerMap['deliveryCharge'] : -1;

      // Smart Image Column Auto-detection:
      // If we couldn't find an image column by header, look at the first few rows for cell values ending with image extensions
      if (imageIdx === -1) {
        for (let rIdx = 0; rIdx < Math.min(5, dataRows.length); rIdx++) {
          const row = dataRows[rIdx];
          if (!row) continue;
          for (let cIdx = 0; cIdx < row.length; cIdx++) {
            const val = String(row[cIdx]).toLowerCase().trim();
            if (/\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(val)) {
              imageIdx = cIdx;
              break;
            }
          }
          if (imageIdx !== -1) break;
        }
      }
      // Absolute fallback if still not detected
      if (imageIdx === -1) imageIdx = 5;

      // Pre-parse rows
      const parsedRows: any[] = [];
      const startLine = isHeaderRow ? 1 : 0;

      for (let i = startLine; i < dataRows.length; i++) {
        const values = dataRows[i];
        if (values.length === 0 || !values[nameIdx]) continue;
        
        parsedRows.push({
          name: values[nameIdx],
          price: parseFloat(values[priceIdx]) || 0,
          originalPrice: originalPriceIdx !== -1 ? (parseFloat(values[originalPriceIdx]) || undefined) : undefined,
          deliveryCharge: deliveryChargeIdx !== -1 ? (parseFloat(values[deliveryChargeIdx]) || 30) : 30,
          stock: stockIdx !== -1 ? (parseInt(values[stockIdx]) || 50) : 50,
          category: categoryIdx !== -1 ? (values[categoryIdx] || 'Uncategorized') : 'Uncategorized',
          imageVal: imageIdx !== -1 && imageIdx < values.length ? (values[imageIdx] || '') : '',
          brand: brandIdx !== -1 && brandIdx < values.length ? (values[brandIdx] || '') : '',
          description: descIdx !== -1 && descIdx < values.length ? (values[descIdx] || '') : '',
        });
      }

      if (parsedRows.length === 0) {
        throw new Error('No valid products found in Excel/CSV');
      }

      // Step 2: Upload all selected local image files to Cloudinary
      const filenameToUrlMap: { [key: string]: string } = {};
      const uploadedUrlsInOrder: string[] = []; // Maintain the exact sequential upload order

      if (selectedCsvImages && selectedCsvImages.length > 0) {
        const imagesList = Array.from(selectedCsvImages);
        const batchSize = 3;
        
        for (let k = 0; k < imagesList.length; k += batchSize) {
          const batch = imagesList.slice(k, k + batchSize);
          const currentBatchEnd = Math.min(k + batchSize, imagesList.length);
          setCsvImportProgress(`Uploading images ${k + 1} to ${currentBatchEnd} of ${imagesList.length}...`);
          toast.loading(`Uploading images ${k + 1}-${currentBatchEnd}/${imagesList.length}...`, { id: 'csvImport' });
          
          await Promise.all(batch.map(async (imgFile) => {
            try {
              const formDataPayload = new FormData();
              formDataPayload.append('image', imgFile);
              const res = await fetchWithAuth('/api/upload', { method: 'POST', body: formDataPayload });
              if (res.ok) {
                const data = await res.json();
                if (data.imageUrl) {
                  filenameToUrlMap[imgFile.name.toLowerCase().trim()] = data.imageUrl;
                  uploadedUrlsInOrder.push(data.imageUrl);
                }
              } else {
                console.error(`Failed uploading ${imgFile.name}: Status ${res.status}`);
              }
            } catch (uploadErr) {
              console.error(`Error uploading ${imgFile.name}:`, uploadErr);
            }
          }));
        }
      }

      // Step 3: Map Cloudinary URLs or fallbacks
      const finalProducts: Product[] = parsedRows.map((row, index) => {
        let finalImageUrl = '';
        const imgRef = row.imageVal.trim().toLowerCase();
        const imgRefWithoutExt = imgRef.replace(/\.[^/.]+$/, "");
        
        // Method 1: Match by filename
        let matchedUrl = '';
        if (imgRef) {
          Object.keys(filenameToUrlMap).forEach(key => {
            const keyWithoutExt = key.replace(/\.[^/.]+$/, "");
            if (key === imgRef || keyWithoutExt === imgRefWithoutExt) {
              matchedUrl = filenameToUrlMap[key];
            }
          });
        }

        // Method 2: Sequential fallback pairing (Product index matches image selection index)
        if (!matchedUrl && uploadedUrlsInOrder.length > 0) {
          const fallbackIdx = index % uploadedUrlsInOrder.length;
          matchedUrl = uploadedUrlsInOrder[fallbackIdx];
        }

        if (matchedUrl) {
          finalImageUrl = matchedUrl;
        } else if (imgRef.startsWith('http://') || imgRef.startsWith('https://')) {
          finalImageUrl = row.imageVal;
        } else {
          finalImageUrl = `https://placehold.co/600x600/f3f4f6/9ca3af?text=${encodeURIComponent(row.name)}`;
        }

        return {
          id: `prod_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
          name: row.name,
          category: row.category,
          price: row.price,
          originalPrice: row.originalPrice,
          deliveryCharge: row.deliveryCharge,
          stock: row.stock,
          image: finalImageUrl,
          brand: row.brand,
          description: row.description,
          isVisible: true,
          isFeatured: false
        };
      });

      setCsvImportProgress('Saving products to database...');
      toast.loading('Saving products to database...', { id: 'csvImport' });
      
      const res = await fetchWithAuth('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProducts),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to bulk save products");
      }

      // Refresh products list via authenticated admin route
      const prodRes = await fetchWithAuth('/api/products/all');
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || data);
      }

      toast.success(`Successfully imported ${finalProducts.length} products!`, { id: 'csvImport' });
      setIsCsvModalOpen(false);
      setSelectedCsvFile(null);
      setSelectedCsvImages(null);
    } catch (err: any) {
      console.error(err);
      toast.error(`Import failed: ${err.message || err}`, { id: 'csvImport' });
    } finally {
      setIsCsvImporting(false);
      setCsvImportProgress('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium w-full sm:w-64 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none shadow-sm transition-all"
            />
          </div>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => setIsCsvModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Upload size={16} />
            CSV
          </button>
          <button 
            onClick={() => openModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-gray-900 text-white' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Advanced Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm align-middle">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-center w-24">HERO<br/>SLIDER</th>
                <th className="px-5 py-3">PRODUCT</th>
                <th className="px-5 py-3">CATEGORY</th>
                <th className="px-5 py-3">PRICE</th>
                <th className="px-5 py-3 text-center">STOCK</th>
                <th className="px-5 py-3">VISIBILITY</th>
                <th className="px-5 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product, idx) => (
                <tr key={product.id || product._id || idx} className={`hover:bg-gray-50/50 ${product.isVisible === false ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={product.isFeatured || false}
                      onChange={(e) => handleToggleFeatured(product, e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" 
                    />
                  </td>
                  <td className="px-5 py-4 min-w-[250px]">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">ID: {product.id ? product.id.slice(0,8) : 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div className="max-w-[120px]">
                      {product.category}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    â‚¹{product.price}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <div className={`${(product.stock || 0) > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} rounded-md px-2 py-1 text-xs font-semibold text-center min-w-[60px]`}>
                        {product.stock || 0} in<br/>stock
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button 
                      onClick={() => handleToggleVisibility(product)}
                      className={`flex items-center gap-1.5 font-medium text-sm px-3 py-1.5 rounded-full transition-colors ${
                        product.isVisible !== false 
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {product.isVisible !== false ? (
                        <><Eye size={16} /> Visible</>
                      ) : (
                        <><EyeOff size={16} /> Hidden</>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(product, true)} title="Duplicate" className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => openModal(product)} title="Edit" className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product)} title="Delete" className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-50 rounded-md">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto pt-safe sm:pt-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden mt-8 mb-20 sm:my-8 shrink-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      type="text" required value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required value={formData.category || ''}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {apiCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand (Optional)</label>
                      <input 
                        type="text" value={formData.brand || ''}
                        onChange={e => setFormData({...formData, brand: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Optional)</label>
                      <input 
                        type="text" value={formData.sku || ''}
                        onChange={e => setFormData({...formData, sku: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input 
                        type="number" required min="0" value={formData.price || ''}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                      <input 
                        type="number" min="0" value={formData.originalPrice || ''}
                        onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge</label>
                      <input 
                        type="number" min="0" value={formData.deliveryCharge ?? 30}
                        onChange={e => setFormData({...formData, deliveryCharge: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" min="0" value={formData.stock || 0}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Drag & Drop)</label>
                    <div className="flex flex-col gap-3">
                      
                      {/* Image Gallery Preview */}
                      {(formData.images && formData.images.length > 0) ? (
                        <div className="grid grid-cols-3 gap-2">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className={`relative h-24 bg-gray-100 rounded-lg overflow-hidden border ${img === formData.image ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'}`}>
                              <img src={img} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 text-red-500"
                              >
                                <X size={14} />
                              </button>
                              {img !== formData.image && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({...formData, image: img})}
                                  className="absolute bottom-1 left-1 right-1 bg-white/90 text-xs font-semibold py-0.5 rounded shadow text-center text-gray-700"
                                >
                                  Set Main
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                          {isUploading ? (
                            <Loader className="w-8 h-8 animate-spin text-gray-900" />
                          ) : (
                            <>
                              <ImageIcon size={32} className="mb-2 text-gray-300" />
                              <span className="text-sm">No images selected</span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                        />
                        <button 
                          type="button" 
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300"
                        >
                          <Upload size={16} />
                          Gallery
                        </button>

                        <input 
                          type="file" 
                          accept="image/*"
                          capture="environment"
                          className="hidden" 
                          ref={cameraInputRef} 
                          onChange={handleFileUpload} 
                        />
                        <button 
                          type="button" 
                          disabled={isUploading}
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Camera size={16} />
                          Camera
                        </button>
                      </div>

                      <div className="relative mt-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-white px-2 text-gray-500">Or Paste URL</span>
                        </div>
                      </div>

                      <input 
                        type="url" placeholder="https://..." value={formData.image || ''}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" checked={formData.isVisible !== false}
                        onChange={e => setFormData({...formData, isVisible: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">Visible on Storefront</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" checked={formData.isFeatured || false}
                        onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">Show in Hero Slider</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 mt-6">
                <button 
                  type="button" onClick={closeModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSaving}
                  className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCsvModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 relative">
            <button 
              onClick={() => {
                if (!isCsvImporting) {
                  setIsCsvModalOpen(false);
                  setSelectedCsvFile(null);
                  setSelectedCsvImages(null);
                }
              }}
              disabled={isCsvImporting}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Upload className="text-gray-900" size={20} />
              Import Products Excel / CSV & Images
            </h2>
            
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Upload a <strong>.xlsx / .xls (Excel)</strong> or <strong>.csv</strong> file and corresponding local photos. Matching is done automatically based on the filename in the <strong>Image</strong> column.
            </p>

            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200/60 mb-4 text-xs text-gray-600 space-y-1.5">
              <div className="font-semibold text-neutral-800">Required Columns (in any order):</div>
              <div>• <strong>Name</strong>, <strong>Price</strong></div>
              <div className="font-semibold text-neutral-800 pt-1">Optional Columns:</div>
              <div>• <strong>Category</strong>, <strong>Stock</strong>, <strong>Brand</strong>, <strong>Description</strong>, <strong>Image</strong> (e.g. <code>pen.jpg</code>)</div>
            </div>

            {isCsvImporting ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm font-semibold text-gray-800">Importing Products...</div>
                <div className="text-xs text-gray-500 text-center px-4 font-medium">{csvImportProgress}</div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const headers = ["Name", "Category", "Price", "OriginalPrice", "Stock", "Image", "Brand", "Description"];
                    const sampleRow = ["Premium Notebook", "Stationery", "120", "150", "200", "notebook.jpg", "Rappani", "Hardcover ruled notebook"];
                    const csvContent = headers.join(',') + '\n' + sampleRow.join(',');
                    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", "rappani_products_template.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 rounded-lg text-xs font-semibold bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  📥 Download Excel/CSV Template
                </button>

                {/* Step 1: Select CSV file */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Step 1: Select Excel or CSV File</label>
                  {selectedCsvFile ? (
                    <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5">
                      <span className="text-xs font-medium text-emerald-800 truncate pr-2">📄 {selectedCsvFile.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedCsvFile(null)}
                        className="text-[10px] text-red-500 hover:underline font-bold shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        accept=".csv, .xlsx, .xls" 
                        ref={csvFileInputRef}
                        onChange={(e) => {
                          if (e.target.files?.[0]) setSelectedCsvFile(e.target.files[0]);
                        }} 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => csvFileInputRef.current?.click()}
                        className="w-full py-3 border border-neutral-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        📁 Choose Excel / CSV File
                      </button>
                    </>
                  )}
                </div>

                {/* Step 2: Select Local Images */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Step 2: Select Product Images (Optional)</label>
                  {selectedCsvImages && selectedCsvImages.length > 0 ? (
                    <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 rounded-lg p-2.5">
                      <span className="text-xs font-medium text-blue-800 truncate pr-2">🖼️ {selectedCsvImages.length} images selected</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedCsvImages(null)}
                        className="text-[10px] text-red-500 hover:underline font-bold shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        multiple
                        accept="image/*" 
                        ref={csvImagesInputRef}
                        onChange={(e) => {
                          if (e.target.files) setSelectedCsvImages(e.target.files);
                        }} 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => csvImagesInputRef.current?.click()}
                        className="w-full py-3 border border-neutral-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        📷 Select Photos (Multi-select)
                      </button>
                    </>
                  )}
                </div>

                {/* Submit Import */}
                <button
                  type="button"
                  onClick={handleCsvImportSubmit}
                  disabled={!selectedCsvFile}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-lg text-sm font-semibold shadow-sm transition-colors mt-2"
                >
                  🚀 Start Import Products & Photos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
