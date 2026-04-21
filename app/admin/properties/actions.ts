"use server";

import { getAdminSupabaseForAction } from "@/lib/supabase/admin-data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PropertyStatus } from "@/lib/types";

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function deletePropertyAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const gate = await getAdminSupabaseForAction();
  if ("error" in gate) return;
  const { db } = gate;
  const { error } = await db.from("properties").delete().eq("id", id);
  if (error) return;
  revalidatePath("/admin/properties");
}

export async function saveProperty(_prev: unknown, formData: FormData) {
  const gate = await getAdminSupabaseForAction();
  if ("error" in gate) {
    return { error: gate.error };
  }
  const { db } = gate;

  const id = (formData.get("id") as string | null)?.trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "El título es obligatorio" };

  const description = String(formData.get("description") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const total_investment = num(formData, "total_investment");
  const purchase_price = num(formData, "purchase_price");
  const duration_years =
    num(formData, "duration_years") !== null
      ? Math.round(num(formData, "duration_years")!)
      : null;
  const yield_percent = num(formData, "yield_percent");
  const status = String(formData.get("status") ?? "available") as PropertyStatus;

  const imageFile = formData.get("image") as File | null;
  const pdfFile = formData.get("pdf") as File | null;

  const row = {
    title,
    description,
    location,
    total_investment,
    purchase_price,
    duration_years,
    yield_percent,
    status,
  };

  if (id) {
    const { data: existing, error: fetchErr } = await db
      .from("properties")
      .select("image_url,pdf_url")
      .eq("id", id)
      .single();
    if (fetchErr) return { error: fetchErr.message };

    let image_url = existing?.image_url ?? null;
    let pdf_url = existing?.pdf_url ?? null;

    if (imageFile && imageFile.size > 0) {
      const path = `properties/${id}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await db.storage
        .from("property-images")
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
      if (upErr) return { error: upErr.message };
      const { data: pub } = db.storage.from("property-images").getPublicUrl(path);
      image_url = pub.publicUrl;
    }

    if (pdfFile && pdfFile.size > 0) {
      const path = `properties/${id}/${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await db.storage
        .from("property-pdfs")
        .upload(path, pdfFile, { upsert: true, contentType: pdfFile.type });
      if (upErr) return { error: upErr.message };
      const { data: pub } = db.storage.from("property-pdfs").getPublicUrl(path);
      pdf_url = pub.publicUrl;
    }

    const { error } = await db
      .from("properties")
      .update({ ...row, image_url, pdf_url })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data: inserted, error: insErr } = await db
      .from("properties")
      .insert(row)
      .select("id")
      .single();
    if (insErr) return { error: insErr.message };
    const newId = inserted!.id as string;

    let image_url: string | null = null;
    let pdf_url: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const path = `properties/${newId}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await db.storage
        .from("property-images")
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
      if (upErr) return { error: upErr.message };
      const { data: pub } = db.storage.from("property-images").getPublicUrl(path);
      image_url = pub.publicUrl;
    }

    if (pdfFile && pdfFile.size > 0) {
      const path = `properties/${newId}/${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await db.storage
        .from("property-pdfs")
        .upload(path, pdfFile, { upsert: true, contentType: pdfFile.type });
      if (upErr) return { error: upErr.message };
      const { data: pub } = db.storage.from("property-pdfs").getPublicUrl(path);
      pdf_url = pub.publicUrl;
    }

    if (image_url || pdf_url) {
      const { error } = await db
        .from("properties")
        .update({ image_url, pdf_url })
        .eq("id", newId);
      if (error) return { error: error.message };
    }
  }

  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}
