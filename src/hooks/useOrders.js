// src/hooks/useOrders.js
import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getShopById } from '../config/locations';

/**
 * Loads and mutates the signed-in user's orders.
 * Returns:
 *   orders, loading, error,
 *   refresh(),
 *   createPrintOrder({ files, printOptions, pickupShopId }),
 *   createPhotocopyOrder({ mode, ...fields }),
 *   cancelOrder(orderId)
 *
 * createPhotocopyOrder modes:
 *   - 'digital'   → files, printOptions, pickupShopId
 *   - 'course_rep'→ documentDescription, pageEstimate, scheduledReceiveDate, scheduledReturnDate, estimatedCost
 *   - 'courier'   → documentDescription, pageEstimate, pickupAddress, estimatedCost
 *   - 'dropoff'   → documentDescription, pageEstimate, dropoffShopId, estimatedCost
 */
export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*, order_files(id, file_name, file_path, file_size, mime_type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ------------------------------------------------------------
  // PRINT
  // ------------------------------------------------------------
  const createPrintOrder = useCallback(
    async ({ files, printOptions, pickupShopId }) => {
      if (!user?.id) throw new Error('You must be signed in to place an order.');
      if (!files || files.length === 0) {
        throw new Error('Please attach at least one document.');
      }
      if (!pickupShopId) {
        throw new Error('Please choose a pickup shop.');
      }

      const shopInfo = getShopById(pickupShopId);
      if (!shopInfo) throw new Error('Invalid pickup shop selected.');

      const uploadedPaths = [];
      const fileRecords = [];

      try {
        for (const file of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const path = `${user.id}/${unique}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from('order-files')
            .upload(path, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || 'application/octet-stream',
            });
          if (uploadError) throw uploadError;

          uploadedPaths.push(path);
          fileRecords.push({
            file_name: file.name,
            file_path: path,
            file_size: file.size,
            mime_type: file.type || 'application/octet-stream',
          });
        }

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            service_type: 'print',
            physical_route: 'pickup',
            pickup_shop: pickupShopId,
            pickup_location: shopInfo.market || null,
            details: {
              ...printOptions,
              file_count: files.length,
              file_names: files.map((f) => f.name),
              pickup_shop_name: shopInfo.name,
              pickup_market: shopInfo.market,
            },
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const { error: fileError } = await supabase
          .from('order_files')
          .insert(
            fileRecords.map((r) => ({
              ...r,
              order_id: order.id,
              user_id: user.id,
            }))
          );

        if (fileError) throw fileError;

        await refresh();
        return order;
      } catch (err) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from('order-files').remove(uploadedPaths);
        }
        throw err;
      }
    },
    [user?.id, refresh]
  );

  // ------------------------------------------------------------
  // PHOTOCOPY
  // ------------------------------------------------------------
  const createPhotocopyOrder = useCallback(
    async (payload) => {
      if (!user?.id) throw new Error('You must be signed in to place an order.');
      const { mode } = payload;

      if (mode === 'digital') {
        return createDigitalPhotocopy(user, payload, refresh);
      }
      if (mode === 'course_rep') {
        return createCourseRepPhotocopy(user, payload, refresh);
      }
      if (mode === 'courier') {
        return createCourierPhotocopy(user, payload, refresh);
      }
      if (mode === 'dropoff') {
        return createDropoffPhotocopy(user, payload, refresh);
      }
      throw new Error('Unknown photocopy mode.');
    },
    [user, refresh]
  );

  const cancelOrder = useCallback(
    async (orderId) => {
      const { error: cancelError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (cancelError) throw cancelError;
      await refresh();
    },
    [refresh]
  );

  return {
    orders,
    loading,
    error,
    refresh,
    createPrintOrder,
    createPhotocopyOrder,
    cancelOrder,
  };
}

// ------------------------------------------------------------
// Internal helpers (kept outside the hook for clarity)
// ------------------------------------------------------------

async function createDigitalPhotocopy(user, { files, printOptions, pickupShopId }, refresh) {
  if (!files || files.length === 0) {
    throw new Error('Please attach at least one document.');
  }
  if (!pickupShopId) throw new Error('Please choose a pickup shop.');

  const shopInfo = getShopById(pickupShopId);
  if (!shopInfo) throw new Error('Invalid pickup shop selected.');

  const uploadedPaths = [];
  const fileRecords = [];

  try {
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const path = `${user.id}/${unique}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('order-files')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream',
        });
      if (uploadError) throw uploadError;

      uploadedPaths.push(path);
      fileRecords.push({
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
      });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        service_type: 'photocopy',
        physical_route: 'pickup',
        pickup_shop: pickupShopId,
        pickup_location: shopInfo.market || null,
        details: {
          ...printOptions,
          source: 'digital',
          file_count: files.length,
          file_names: files.map((f) => f.name),
          pickup_shop_name: shopInfo.name,
          pickup_market: shopInfo.market,
        },
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: fileError } = await supabase
      .from('order_files')
      .insert(
        fileRecords.map((r) => ({
          ...r,
          order_id: order.id,
          user_id: user.id,
        }))
      );

    if (fileError) throw fileError;

    await refresh();
    return order;
  } catch (err) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from('order-files').remove(uploadedPaths);
    }
    throw err;
  }
}

async function createCourseRepPhotocopy(
  user,
  { documentDescription, pageEstimate, scheduledReceiveDate, scheduledReturnDate, estimatedCost, copies = 1 },
  refresh
) {
  if (!documentDescription?.trim()) throw new Error('Please describe the document.');
  if (!scheduledReceiveDate) throw new Error('Please pick the day your rep receives the work.');
  if (!scheduledReturnDate) throw new Error('Please pick the day your rep returns the work.');

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      service_type: 'photocopy',
      physical_route: 'course_rep',
      document_description: documentDescription.trim(),
      page_count_estimated: pageEstimate?.mid ?? null,
      scheduled_receive_date: scheduledReceiveDate,
      scheduled_return_date: scheduledReturnDate,
      details: {
        source: 'physical',
        route: 'course_rep',
        page_range_id: pageEstimate?.id ?? null,
        page_range_label: pageEstimate?.label ?? null,
        copies,
        estimated_cost: estimatedCost,
        pricing_source: 'placeholder_client_estimate',
        deposit_note:
          'This is an estimated deposit. Staff will confirm the exact page count and final price.',
      },
    })
    .select()
    .single();

  if (error) throw error;
  await refresh();
  return order;
}

async function createCourierPhotocopy(
  user,
  { documentDescription, pageEstimate, pickupAddress, estimatedCost, copies = 1 },
  refresh
) {
  if (!documentDescription?.trim()) throw new Error('Please describe the document.');
  if (!pickupAddress?.trim()) throw new Error('Please tell us where the courier should pick up.');

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      service_type: 'photocopy',
      physical_route: 'pickup',
      document_description: documentDescription.trim(),
      page_count_estimated: pageEstimate?.mid ?? null,
      pickup_address: pickupAddress.trim(),
      details: {
        source: 'physical',
        route: 'courier',
        page_range_id: pageEstimate?.id ?? null,
        page_range_label: pageEstimate?.label ?? null,
        copies,
        estimated_cost: estimatedCost,
        pricing_source: 'placeholder_client_estimate',
        deposit_note:
          'This is an estimated deposit. Staff will confirm the exact page count and final price.',
      },
    })
    .select()
    .single();

  if (error) throw error;
  await refresh();
  return order;
}

async function createDropoffPhotocopy(
  user,
  { documentDescription, pageEstimate, dropoffShopId, estimatedCost, copies = 1 },
  refresh
) {
  if (!documentDescription?.trim()) throw new Error('Please describe the document.');
  if (!dropoffShopId) throw new Error('Please pick a drop-off shop.');

  const shopInfo = getShopById(dropoffShopId);
  if (!shopInfo) throw new Error('Invalid drop-off shop selected.');

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      service_type: 'photocopy',
      physical_route: 'dropoff',
      pickup_shop: dropoffShopId,
      pickup_location: shopInfo.market || null,
      dropoff_location: shopInfo.name,
      document_description: documentDescription.trim(),
      page_count_estimated: pageEstimate?.mid ?? null,
      details: {
        source: 'physical',
        route: 'dropoff',
        page_range_id: pageEstimate?.id ?? null,
        page_range_label: pageEstimate?.label ?? null,
        copies,
        estimated_cost: estimatedCost,
        pricing_source: 'placeholder_client_estimate',
        dropoff_shop_name: shopInfo.name,
        dropoff_market: shopInfo.market,
        deposit_note:
          'This is an estimated deposit. Staff will confirm the exact page count and final price.',
      },
    })
    .select()
    .single();

  if (error) throw error;
  await refresh();
  return order;
}