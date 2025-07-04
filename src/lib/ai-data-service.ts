import { supabase } from '@/lib/supabase.server'

export type Filter =
  | [string, any]                                      // eq
  | [string, string, any]                              // eq, gt, lt, in, is...
  | [string, 'not', string, any];                      // not('col', 'is', null)

export const applyFilters = <T>(q: T, filters: Filter[]): T => {
  console.log(filters)

  for (const filter of filters) {
    if (filter.length === 2) {
      const [col, val] = filter;
      
      if (col === 'or' && typeof val === 'string') {
        q = (q as any).or(val);
      } else {
        q = (q as any).eq(col, val);
      }
      
    } else if (filter.length === 3) {
      const [col, op, val] = filter;
      
      if (col === 'or' && typeof val === 'string') {
        q = (q as any).or(val, {foreignTable: op}); // when needed
      } else if (op === 'in' && Array.isArray(val)) {
        q = (q as any).in(col, val);
      } else if (op === 'is') {
        q = (q as any).is(col, val);
      } else {
        q = (q as any)[op](col, val);
      }
      
    } else if (filter.length === 4 && filter[1] === 'not') {
      const [col, , op, val] = filter;
      q = (q as any).not(col, op, val);
    }
  }
  
  return q;
};

export interface AIDataRequest {
  table: string;
  select: string[];
  filters: Filter[];
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
  caption: string;
}

// Hackathons table function
export const hackathons_fn = async (select: string[] = ['*'], filters: Filter[] = [], limit?: number, orderBy?: { column: string; ascending?: boolean }) => {
  const sb = await supabase();
  let query = sb.from('hackathons').select(select.join(','));
  
  query = applyFilters(query, filters);
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Teams table function
export const teams_fn = async (select: string[] = ['*'], filters: Filter[] = [], limit?: number, orderBy?: { column: string; ascending?: boolean }) => {
  const sb = await supabase();
  let query = sb.from('teams').select(select.join(','));
  
  query = applyFilters(query, filters);
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Users table function
export const users_fn = async (select: string[] = ['*'], filters: Filter[] = [], limit?: number, orderBy?: { column: string; ascending?: boolean }) => {
  const sb = await supabase();
  let query = sb.from('users').select(select.join(','));
  
  query = applyFilters(query, filters);
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Hackathon registrations table function
export const hackathon_registrations_fn = async (select: string[] = ['*'], filters: Filter[] = [], limit?: number, orderBy?: { column: string; ascending?: boolean }) => {
  const sb = await supabase();
  let query = sb.from('hackathon_registrations').select(select.join(','));
  
  query = applyFilters(query, filters);
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Team members table function
export const team_members_fn = async (select: string[] = ['*'], filters: Filter[] = [], limit?: number, orderBy?: { column: string; ascending?: boolean }) => {
  const sb = await supabase();
  let query = sb.from('team_members').select(select.join(','));
  
  query = applyFilters(query, filters);
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Organizations table function
export const organizations_fn = async (select: string[] = ['*'], filters: Filter[] = [], limit?: number, orderBy?: { column: string; ascending?: boolean }) => {
  const sb = await supabase();
  let query = sb.from('organizations').select(select.join(','));
  
  query = applyFilters(query, filters);
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Participant feedback table function
export const participant_feedback_fn = async (select: string[] = ['*'], filters: Filter[] = [], limit?: number, orderBy?: { column: string; ascending?: boolean }) => {
  const sb = await supabase();
  let query = sb.from('participant_feedback').select(select.join(','));
  
  query = applyFilters(query, filters);
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Hackathon views table function
export const hackathon_views_fn = async (select: string[] = ['*'], filters: Filter[] = [], limit?: number, orderBy?: { column: string; ascending?: boolean }) => {
  const sb = await supabase();
  let query = sb.from('hackathon_views').select(select.join(','));
  
  query = applyFilters(query, filters);
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Main function mapper
export const TABLE_FUNCTIONS = {
  hackathons: hackathons_fn,
  teams: teams_fn,
  users: users_fn,
  hackathon_registrations: hackathon_registrations_fn,
  team_members: team_members_fn,
  organizations: organizations_fn,
  participant_feedback: participant_feedback_fn,
  hackathon_views: hackathon_views_fn,
};

// Execute AI data request
export const executeAIDataRequest = async (request: AIDataRequest) => {
  const fn = TABLE_FUNCTIONS[request.table as keyof typeof TABLE_FUNCTIONS];
  if (!fn) {
    throw new Error(`Table function not found for: ${request.table}`);
  }
  
  return await fn(request.select, request.filters, request.limit, request.orderBy);
};

// Database schema for AI context
export const DATABASE_SCHEMA = {
  hackathons: {
    columns: [
      'id', 'title', 'description', 'theme', 'difficulty_level', 'status',
      'registration_start', 'registration_end', 'start_date', 'end_date',
      'timezone', 'location', 'is_virtual', 'max_participants', 'min_team_size',
      'max_team_size', 'prize_pool', 'rules', 'poster_url', 'requirements',
      'judging_criteria', 'organizer_id', 'organization_id', 'view_count',
      'registration_count', 'featured', 'created_at', 'updated_at'
    ],
    relationships: {
      organizer_id: 'users.id',
      organization_id: 'organizations.id'
    }
  },
  users: {
    columns: [
      'id', 'email', 'username', 'full_name', 'bio', 'avatar_url',
      'github_username', 'linkedin_url', 'website_url', 'location', 'timezone',
      'skills', 'preferences', 'role', 'email_verified', 'stripe_customer_id',
      'created_at', 'updated_at'
    ],
    relationships: {}
  },
  teams: {
    columns: [
      'id', 'name', 'description', 'hackathon_id', 'leader_id', 'status',
      'looking_for_members', 'skills_wanted', 'min_team_size', 'max_team_size',
      'created_at', 'updated_at'
    ],
    relationships: {
      hackathon_id: 'hackathons.id',
      leader_id: 'users.id'
    }
  },
  hackathon_registrations: {
    columns: [
      'id', 'hackathon_id', 'user_id', 'team_id', 'status', 'registration_data',
      'completed', 'registered_at'
    ],
    relationships: {
      hackathon_id: 'hackathons.id',
      user_id: 'users.id',
      team_id: 'teams.id'
    }
  },
  team_members: {
    columns: [
      'id', 'team_id', 'user_id', 'role', 'joined_at'
    ],
    relationships: {
      team_id: 'teams.id',
      user_id: 'users.id'
    }
  },
  organizations: {
    columns: [
      'id', 'name', 'slug', 'description', 'logo_url', 'website_url',
      'industry', 'size', 'verification_status', 'subscription_tier',
      'subscription_expires_at', 'created_at', 'updated_at'
    ],
    relationships: {}
  },
  participant_feedback: {
    columns: [
      'id', 'hackathon_id', 'user_id', 'rating', 'feedback', 'created_at'
    ],
    relationships: {
      hackathon_id: 'hackathons.id',
      user_id: 'users.id'
    }
  },
  hackathon_views: {
    columns: [
      'id', 'hackathon_id', 'user_id', 'viewed_at'
    ],
    relationships: {
      hackathon_id: 'hackathons.id',
      user_id: 'users.id'
    }
  }
};