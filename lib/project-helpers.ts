import { useEffect } from "react";
import { useState } from "react";
import { Project } from "../db/models/project";

export class ProjectFormValues {
  public name: string = "";
  public goal: string = "";
  public owner: string = "";
  public champion: string = "";
  public adminEmails: string[] = [];

  public constructor(init?: Partial<ProjectFormValues>) {
    Object.assign(this, init);
  }
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project>();
  const [error, setError] = useState<string>();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const getProject = async () => {
      setLoading(true);

      if (!id) return;

      try {
        const result = await fetch(`/api/v1/projects/${id}`);
        const projectResult = await result.json();
        if (result.status === 200) {
          setProject(projectResult);
        } else {
          setError(projectResult.error);
        }
      } catch (ex) {
        console.error(ex);
        setError("An error occurred when fetching the project information.");
      }

      setLoading(false);
    };

    getProject();
  }, [id]);

  return { project, error, isLoading }
}
