"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { MenuItemCard } from "@/components/bulkMenuUpload/MenuItemCard";
import { EditItemModal } from "@/components/bulkMenuUpload/EditItemModal";
import Link from "next/link";
import { useBulkUpload } from "@/hooks/useBulkUpload";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserData } from "@/store/authStore";
import { useMenuStore } from "@/store/menuStore";

const BulkUpload = () => {
  const [hotels, setHotels] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { fetchMenu } = useMenuStore();

  const {
    jsonInput,
    menuItems,
    selectAll,
    isEditModalOpen,
    isUploading,
    isBulkUploading,
    editingItem,
    setJsonInput,
    handleJsonSubmit,
    handleClear,
    handleAddToMenu,
    handleDelete,
    handleSelectAll,
    handleSelectItem,
    handleUploadSelected,
    handleEdit,
    handleSaveEdit,
    handleImageClick,
    setIsEditModalOpen,
    setEditingItem,
    handleHotelSelect,
  } = useBulkUpload();

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "hotel")
        );
        const querySnapshot = await getDocs(q);
        const hotelData:UserData[] = [];
        querySnapshot.forEach((doc) => {
          hotelData.push({ id: doc.id, ...doc.data() } as UserData);
        });
        setHotels(hotelData);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
      setIsLoading(false);
    };

    fetchHotels();
  }, []);

  const filteredHotels = hotels.filter((hotel) =>
    hotel.hotelName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHotelSelection = async (hotel: UserData) => {
    setSelectedHotel(hotel);
    setShowDropdown(false);
    setSearchTerm(hotel.hotelName || "");
    
    // Fetch the selected hotel's menu
    if (hotel.id) {
      await handleHotelSelect(hotel.id);
      await fetchMenu(hotel.id);
    }
  };

  return (
    <div className="min-h-screen w-full ">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="mb-6 relative">
            <Input
              type="text"
              placeholder="Search hotels..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="mb-2 bg-white"
            />
            {showDropdown && (searchTerm || isLoading) && (
              <div className="absolute w-full z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4 bg-white rounded-md shadow-lg">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto bg-white rounded-md shadow-lg">
                    {filteredHotels.length > 0 ? (
                      filteredHotels.map((hotel) => (
                        <div
                          key={hotel.id}
                          className={`p-2 cursor-pointer hover:bg-gray-100 ${
                            selectedHotel?.id === hotel.id ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => handleHotelSelection(hotel)}
                        >
                          {hotel.hotelName}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">No hotels found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link target="_blank" className="underline text-sm py-2 text-blue-500 hover:text-blue-600 block text-right" href={"https://kimi.moonshot.cn/chat"}>Go to KIMI.ai {"->"}</Link>

          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON menu items here..."
            className="min-h-[200px] mb-4"
          />
          <div className="flex gap-2">
            <Button 
              className="text-[13px] w-full" 
              onClick={handleJsonSubmit}
              disabled={!selectedHotel}
            >
              {menuItems.length > 0 ? "Update JSON" : "Convert JSON"}
            </Button>

            {menuItems.length > 0 && (
              <>
                <Button
                  className="text-[13px] w-full"
                  variant="destructive"
                  onClick={handleClear}
                >
                  Clear All
                </Button>

                <Button
                  className="text-[13px] w-full"
                  onClick={() => handleUploadSelected(selectedHotel?.id)}
                  disabled={isBulkUploading || !selectedHotel}
                >
                  {isBulkUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Selected"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {menuItems.length > 0 && (
          <div className="mb-4 flex items-center">
            <Checkbox
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              id="selectAll"
            />
            <label htmlFor="selectAll" className="ml-2">
              Select All
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <MenuItemCard
              key={index}
              item={item}
              index={index}
              isUploading={isUploading[index]}
              onSelect={() => handleSelectItem(index)}
              onAddToMenu={() => handleAddToMenu(item, index, selectedHotel?.id)}
              onEdit={() => handleEdit(index, item)}
              onDelete={() => handleDelete(index)}
              onImageClick={() => handleImageClick(index)}
            />
          ))}
        </div>
      </div>

      <EditItemModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editingItem={editingItem}
        onSave={handleSaveEdit}
        onEdit={(field, value) =>
          setEditingItem(
            editingItem
              ? {
                  ...editingItem,
                  item: { ...editingItem.item, [field]: value },
                }
              : null
          )
        }
      />
    </div>
  );
};

export default BulkUpload;
