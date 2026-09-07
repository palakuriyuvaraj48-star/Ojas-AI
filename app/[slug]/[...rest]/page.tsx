import { FeatureExperience } from "@/components/feature-experience";

interface PageProps {
  params: Promise<{ slug: string; rest: string[] }>;
}

export default async function NestedFeaturePage({ params }: PageProps) {
  const { slug, rest } = await params;
  return <FeatureExperience path={[slug, ...rest].join("/")} />;
}
