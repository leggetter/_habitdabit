import { useEffect } from "react";
import { useState } from "react";
import { Project } from "../db/models/project";

export class ProjectValues {
  public name: string = "";
  public goal: string = "";
  public owner: string = "";
  public champion: string = "";
  public adminEmails: string[] = [];

  public constructor(init?: Partial<ProjectValues>) {
    Object.assign(this, init);
  }
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectValues>();
  const [error, setError] = useState<string>();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const getProject = async () => {
      setLoading(true);

      if (!id) return;

      try {
        const result = await fetch(`/api/v1/projects/${id}`);
        const json = await result.json();
        if (result.status === 200) {
          const projectResult: ProjectValues = json;
          setProject(projectResult);
        } else {
          setError(json.error);
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
