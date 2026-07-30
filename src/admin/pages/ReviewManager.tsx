import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Trash2, Loader, Search } from 'lucide-react';

export default function ReviewManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string, reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await fetch(`/api/admin/reviews/${productId}/${reviewId}`, { method: 'DELETE' });
      setReviews(reviews.filter(r => r.reviewId !== reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-primary">Customer Reviews</h2>
          <p className="text-neutral-500 text-sm mt-1">Manage and moderate product reviews</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
          />
          <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <Star className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-700 mb-1">No Reviews Found</h3>
          <p className="text-neutral-500">There are currently no reviews matching your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="p-4 font-semibold text-neutral-600 text-sm">Product</th>
                  <th className="p-4 font-semibold text-neutral-600 text-sm">Customer</th>
                  <th className="p-4 font-semibold text-neutral-600 text-sm">Rating</th>
                  <th className="p-4 font-semibold text-neutral-600 text-sm">Review</th>
                  <th className="p-4 font-semibold text-neutral-600 text-sm">Date</th>
                  <th className="p-4 font-semibold text-neutral-600 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.reviewId} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={review.productImage} alt="" className="w-10 h-10 rounded-md object-cover bg-neutral-100" />
                        <span className="font-medium text-primary text-sm line-clamp-1 max-w-[150px]">{review.productName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-neutral-700 text-sm">{review.customerName}</td>
                    <td className="p-4">
                      <div className="flex text-gold-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-300'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600 max-w-xs truncate" title={review.review}>
                      {review.review}
                    </td>
                    <td className="p-4 text-sm text-neutral-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(review.productId, review.reviewId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
