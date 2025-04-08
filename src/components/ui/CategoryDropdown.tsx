import React, { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Adjust import as necessary
import { menuCatagories } from "@/store/menuStore";
import { useCategoryStore } from "@/store/categoryStore";
import { add } from "date-fns";
import { Input } from "./input";
import { Button } from "./button";
import { Dialog, DialogContent } from "./dialog";
import { toast } from "sonner";

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategoryDropdown = ({
  value,
  onChange,
}: CategoryDropdownProps) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { categories, fetchCategories, addCategory } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOnChange = (value: string) => {
    if (value === "new-cat") {
      setModalOpen(true);
    } else {
      onChange(value);
    }
  };

  return (
    <>
      <Select value={value} onValueChange={handleOnChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new-cat">Create New Category</SelectItem>
          {categories.length > 0
            ? categories?.map((category, index) => (
                <SelectItem key={`${category + index}`} value={category}>
                  {category}
                </SelectItem>
              ))
            : null}
        </SelectContent>
      </Select>

      {isModalOpen && (
        <>
          <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <h2>Add New Category</h2>
              <Input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
              />
              <Button
                disabled={!newCategory || isLoading}
                onClick={() => {
                  if (newCategory) {
                    setIsLoading(true);
                    addCategory(newCategory)
                      .then(() => {
                        onChange(newCategory);
                        setModalOpen(false);
                        setNewCategory("");
                        setIsLoading(false);
                        toast.success("Category created successfully!");
                      })
                      .catch((error) => {
                        setIsLoading(false);
                        toast.error("Error adding category:", error);
                      });
                  }
                }}
              >
                {isLoading ? "Creating..." : "Create Category"}
              </Button>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default CategoryDropdown;
