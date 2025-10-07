import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAuthorizedProjects() {
  const [authorizedProjects, setAuthorizedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthorizedProjects() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch user's project roles
        const { data: roles } = await supabase
          .from('user_project_roles')
          .select('project, role')
          .eq('user_id', user.id);

        if (!roles || roles.length === 0) {
          setLoading(false);
          return;
        }

        // Check if user has access to ALL projects
        const hasAllAccess = roles.some((r: any) => r.project === 'ALL');

        if (hasAllAccess) {
          // User has access to all projects
          setAuthorizedProjects(['ALL']);
        } else {
          // User only has access to specific projects
          const projects = roles.map((r: any) => r.project).filter(p => p !== 'ALL');
          setAuthorizedProjects(projects);
        }
      } catch (err) {
        console.error('Error loading authorized projects:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAuthorizedProjects();
  }, []);

  return { authorizedProjects, loading };
}
