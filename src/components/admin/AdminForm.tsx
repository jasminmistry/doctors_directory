"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminFormProps {
  entityType: "practitioners" | "products" | "clinics";
  apiBasePath: string;
  redirectPath: string;
}

export default function AdminForm({
  entityType,
  apiBasePath,
  redirectPath,
}: AdminFormProps) {
  const [entity, setEntity] = useState<Record<string, any>>({});
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (params.slug === "new") {
      setIsNew(true);
      return;
    }

    fetch(`/directory/api/admin/${entityType}/${params.slug}`)
      .then((res) => res.json())
      .then(setEntity)
      .catch(() => router.push(`/admin/${entityType}`))
      .finally(() => {
        setLoading(false);
      });
  }, [params.slug, router]);

  useEffect(() => {
    if (!entity || Object.keys(entity).length === 0) return;
    setKeys(Object.keys(entity));
  }, [entity]);

  const handleChange = (field: string, value: any) => {
    setEntity({ ...entity, [field]: value });
  };

  const handleSubmit = async () => {
    const url = isNew
      ? `/api/admin/${entityType}`
      : `${apiBasePath}/${params.slug}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entity),
      });

      if (res.ok) {
        const returnTo = searchParams.get("returnTo");
        const destination = returnTo || redirectPath || `/admin/${entityType}`;
        toast.success("Changes saved successfully.");
        setTimeout(() => {
          router.push(destination);
        }, 350);
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || "Failed to save");
      }
    } catch (error) {
      console.error(`Failed to save ${entityType}:`, error);
      toast.error("Failed to save");
    }
  };

  const entityName = entityType;

  if (!isNew && !(entity.slug || entity.practitioner_name))
    return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container max-w-6xl mx-auto space-y-6 py-8 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isNew
            ? `New ${entityName}`
            : `Edit: ${entity.slug ?? entity.practitioner_name}`}
        </h1>
      </div>

      <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keys.map((key, index) => (
            <div key={index}>
              <Label className="mb-2" htmlFor={key}>{key}</Label>
              <Input
                id={key}
                value={(entity[key] as number) || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                className="overflow-hidden whitespace-nowrap text-ellipsis"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </div>
  );
}
