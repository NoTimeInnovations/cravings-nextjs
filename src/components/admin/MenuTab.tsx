import { useEffect, useState, useMemo } from "react";
import { Pen, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // Import the Switch component
import { MenuItem, useMenuStore } from "@/store/menuStore";
import { useAdminOfferStore } from "@/store/useAdminOfferStore";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { AddMenuItemModal } from "../bulkMenuUpload/AddMenuItemModal";
import { EditMenuItemModal } from "./EditMenuItemModal";
import { deleteFileFromS3 } from "@/app/actions/aws-s3";
import { toast } from "sonner";
import { useCategoryStore } from "@/store/categoryStore";
import CategoryUpdateModal from "./CategoryUpdateModal";

export function MenuTab() {
  const { items, addItem, updateItem, deleteItem } = useMenuStore();
  const [isCategoryEditing, setIsCategoryEditing] = useState(false);
  const [editingCategory, seteditingCategory] = useState({
    id: "",
    name: "",
  });
  const [categoriesdItems, setCategoriesdItems] = useState<
    Record<string, MenuItem[]>
  >({});
  const { getCategoryById } = useCategoryStore();
  const { adminOffers, fetchAdminOffers } = useAdminOfferStore();
  const { user } = useAuthStore();
  const [catUpated, setCatUpdated] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    price: string;
    image: string;
    description: string;
    category: string;
  } | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchAdminOffers(user.uid);
    }
  }, [user, fetchAdminOffers]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleAddItem = (item: {
    name: string;
    price: string;
    image: string;
    description: string;
    category: string;
  }) => {
    addItem({
      name: item.name,
      price: parseFloat(item.price),
      image: item.image,
      description: item.description,
      category: item.category,
      hotelId: user?.uid || "",
    });
  };

  const handleEditItem = (item: {
    id: string;
    name: string;
    price: string;
    image: string;
    description: string;
    category: string;
  }) => {
    updateItem(item.id, {
      name: item.name,
      price: parseFloat(item.price),
      image: item.image,
      description: item.description,
      category: item.category,
    });
  };

  const openEditModal = (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
  }) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      price: item.price.toString(),
      image: item.image,
      description: item.description || "",
      category: item.category,
    });
    setIsEditModalOpen(true);
  };
  useEffect(() => {
    const convertToCategorised = async () => {
      if (filteredItems.length > 0) {
        const acc: Record<string, typeof filteredItems> = {};

        for (const item of filteredItems) {
          const category = await getCategoryById(item.category);
          if (category) {
            acc[category] = acc[category] || [];
            acc[category].push(item);
          }
        }
        setCategoriesdItems(acc);
      }
    };

    convertToCategorised();
  }, [filteredItems, getCategoryById, catUpated]);

  const handleCategoryUpdate = async (cat : string , catId : string) => {
    setIsCategoryEditing(true);
    seteditingCategory({
      id : catId,
      name : cat
    });
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Menu Items</h2>
        <div className="flex gap-2">
          <Link href="/admin/bulk-menu-upload">
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddItem}
      />

      {editingItem && (
        <EditMenuItemModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          item={editingItem}
          onSubmit={handleEditItem}
        />
      )}

      {isCategoryEditing && ( 
        <CategoryUpdateModal
          catId={editingCategory?.id || ""}
          cat={editingCategory?.name || ""}
          isOpen={isCategoryEditing}
          setCatUpdated={setCatUpdated}
          catUpdated={catUpated}
          onOpenChange={() => setIsCategoryEditing(false)}
        />
      )}

      <div className="grid gap-4 divide-y-2 divide-gray-300 ">
        {Object.entries(categoriesdItems).sort().map(([category, items]) => {
          return (
            <div key={category} className="pb-10">
              <div className="flex items-center gap-2 group max-w-fit">
                <h1 className="text-2xl lg:text-4xl font-bold my-2 lg:my-5 capitalize w-100 bg-transparent">
                  {category}
                </h1>
                <button onClick={()=>{
                  handleCategoryUpdate(category, items[0].category);
                }} className="group-hover:opacity-100 opacity-0 transition-opacity duration-300">
                  <Pen />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                {items.map((item) => (
                  <Card className="rounded-xl overflow-hidden" key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ₹{item.price.toFixed(2)}
                      </p>
                      {item.description && (
                        <p className="text-gray-600 mt-2">{item.description}</p>
                      )}
                      <div className="flex items-center mt-2">
                        <label className="mr-2">Mark as Top 3:</label>
                        <Switch
                          checked={item.isTop}
                          onCheckedChange={() => {
                            const topItemsCount = filteredItems.filter(
                              (i) => i.isTop
                            ).length;
                            if (item.isTop) {
                              updateItem(item.id, { isTop: false });
                            } else if (topItemsCount < 3) {
                              updateItem(item.id, { isTop: true });
                            } else {
                              toast.error(
                                "You can only mark up to 3 items as Top 3."
                              );
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          openEditModal({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            description: item.description || "",
                            category: item.category,
                          })
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          const isOfferActive = adminOffers.some(
                            (offer) => offer.menuItemId === item.id
                          );
                          if (isOfferActive) {
                            alert(
                              `Cannot delete the menu item "${item.name}" because it has an active offer. Please delete the offer first.`
                            );
                            return;
                          }
                          deleteItem(item.id);
                          await deleteFileFromS3(item.image);
                        }}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
