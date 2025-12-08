import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'menu-images';

export async function uploadMenuImage(file: File, restaurantId: string): Promise<string | null> {
    const supabase = createClient();

    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurantId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    // Get the public URL
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

    return data.publicUrl;
}

export async function deleteMenuImage(imageUrl: string): Promise<boolean> {
    const supabase = createClient();

    // Extract the path from the URL
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return false;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        console.error('Delete error:', error);
        return false;
    }

    return true;
}
