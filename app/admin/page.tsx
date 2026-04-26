'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import productData from '@/data/products.json';
import type { Product } from '@/lib/types';

const products = productData.products as Product[];

export default function MarketDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for dashboard
  const lowStockItems = products.filter(p => !p.inStock);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Market Report Dashboard</h1>
          
          {/* Aggregate Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border border-l-4 border-l-green-500">
              <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Total Revenue</h2>
              <p className="text-3xl font-bold text-foreground">1,245,000 <span className="text-lg font-normal text-muted-foreground">RWF</span></p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border border-l-4 border-l-blue-500">
              <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Pending Orders</h2>
              <p className="text-3xl font-bold text-foreground">14</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border border-l-4 border-l-red-500">
              <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Low Stock Alerts</h2>
              <p className="text-3xl font-bold text-foreground">{lowStockItems.length}</p>
            </div>
          </div>

          {/* Inventory Management Table */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Inventory Management</h2>
              <Button size="sm">Add Product</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 border-b border-border text-sm text-muted-foreground">
                  <tr>
                    <th className="p-4 font-medium">Product ID</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Stock Level</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.slice(0, 10).map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm text-muted-foreground">#{product.id}</td>
                      <td className="p-4 font-medium text-foreground">{product.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                      <td className="p-4 text-sm">{product.price} RWF</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
              Showing top 10 products. View all...
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
