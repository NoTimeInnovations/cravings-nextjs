import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMenuStore } from '@/store/menuStore';
import { useOfferStore } from '@/store/offerStore';
import { useAuthStore } from '@/store/authStore';

export function OffersTab() {
  const { items } = useMenuStore();
  const { offers, addOffer, deleteOffer } = useOfferStore();
  const { userData } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    menuItemId: '',
    newPrice: '',
    itemsAvailable: '',
    fromTime: '',
    toTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addOffer({
      menuItemId: newOffer.menuItemId,
      newPrice: parseFloat(newOffer.newPrice),
      itemsAvailable: parseInt(newOffer.itemsAvailable),
      fromTime: new Date(newOffer.fromTime),
      toTime: new Date(newOffer.toTime),
      category: userData?.category || 'hotel',
    });

    setNewOffer({ menuItemId: '', newPrice: '', itemsAvailable: '', fromTime: '', toTime: '' });
    setIsOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Active Offers</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Offer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menuItem">Select Menu Item</Label>
                <Select
                  value={newOffer.menuItemId}
                  onValueChange={(value) => setNewOffer({ ...newOffer, menuItemId: value })}
                >
                  <SelectTrigger id="menuItem">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - ₹{item.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPrice">New Price in ₹</Label>
                <Input
                  id="newPrice"
                  type="number"
                  placeholder="Enter new price"
                  value={newOffer.newPrice}
                  onChange={(e) => setNewOffer({ ...newOffer, newPrice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemsAvailable">Number of Items Available</Label>
                <Input
                  id="itemsAvailable"
                  type="number"
                  placeholder="Enter quantity"
                  value={newOffer.itemsAvailable}
                  onChange={(e) => setNewOffer({ ...newOffer, itemsAvailable: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromTime">From Time</Label>
                <Input
                  id="fromTime"
                  type="datetime-local"
                  value={newOffer.fromTime}
                  onChange={(e) => setNewOffer({ ...newOffer, fromTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toTime">To Time</Label>
                <Input
                  id="toTime"
                  type="datetime-local"
                  value={newOffer.toTime}
                  onChange={(e) => setNewOffer({ ...newOffer, toTime: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Create Offer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => {
          const menuItem = items.find((item) => item.id === offer.menuItemId);
          if (!menuItem) return null;

          return (
            <Card key={offer.id}>
              <CardHeader>
                <CardTitle>{menuItem.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-lg">
                    Original Price: ₹{offer.originalPrice.toFixed(2)}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    Offer Price: ₹{offer.newPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    From: {new Date(offer.fromTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    To: {new Date(offer.toTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created At: {new Date(offer.createdAt).toLocaleString()}
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full mt-2"
                    onClick={() => deleteOffer(offer.id)}
                  >
                    Delete Offer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
