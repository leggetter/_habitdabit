import { useRouter } from "next/router";
import Layout from "components/layout";
import { useEffect } from "react";

export default function ForwarderPage() {
  const router = useRouter();

  const pad = (value: number) => {
    return value.toString().padStart(2, "0");
  };

  useEffect(() => {
    const today = new Date();
    // Move to Monday
    today.setDate(today.getDate() - today.getDay());
    const path = `${router.asPath}/${today.getFullYear()}-${pad(
      today.getMonth() + 1
    )}-${pad(today.getDate() + 1)}`;
    router.push(path);
  }, [router]);

  return (
    <Layout>
      <p>⏲️ Loading...</p>
    </Layout>
  );
}
