"use client";

import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Section";
import { ProjectsExplorer } from "@/components/sections/ProjectsExplorer";
import { useDict } from "@/components/i18n/I18nProvider";

export default function ProjectsView() {
  const dict = useDict();
  return (
    <>
      <PageHeader
        eyebrow={dict.projects.header.eyebrow}
        title={<>{dict.projects.header.title}</>}
        subtitle={dict.projects.header.subtitle}
      />
      <section className="py-12 md:py-16">
        <Container>
          <ProjectsExplorer />
        </Container>
      </section>
    </>
  );
}
