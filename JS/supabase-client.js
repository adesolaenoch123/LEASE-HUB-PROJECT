const SUPABASE_URL = 'https://bzrqrjonengaovwcjhkt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnFyam9uZW5nYW92d2NqaGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjI1MjAsImV4cCI6MjEwNDQzODUyMH0.tEYenmNuNaaHJdhBBIpigV6qq65iJCZDFt4mV86Eqh0';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { ...user, profile };
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

async function fetchProperties(filters = {}) {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false });

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  const { data, error } = await query;
  if (error) {
    console.error('fetchProperties error:', error);
    return [];
  }
  return data || [];
}

async function getSavedPropertyIds() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('saved_properties')
    .select('property_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('getSavedPropertyIds error:', error);
    return [];
  }
  return (data || []).map((row) => row.property_id);
}

async function toggleSave(propertyId) {
  const user = await getCurrentUser();
  if (!user) {
    alert('Please log in to save properties');
    window.location.href = 'login.html';
    return false;
  }

  const id = Number(propertyId);

  const { data: existing } = await supabase
    .from('saved_properties')
    .select('*')
    .eq('user_id', user.id)
    .eq('property_id', id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', id);
    return false; // not saved anymore
  } else {
    await supabase
      .from('saved_properties')
      .insert({ user_id: user.id, property_id: id });
    return true; // now saved
  }
}