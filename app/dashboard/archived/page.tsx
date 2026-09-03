import ProjectList from "@/components/custom/dashboard/ProjectList";

function ArchivedPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Archived</h1>
        <p className="mt-1 text-muted-foreground">
          Boards you have put away. Restore one to bring it back to All Files.
        </p>
      </div>

      <ProjectList archived />
    </div>
  );
}

export default ArchivedPage;
