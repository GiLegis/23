import { useEffect, useState } from 'react';
import { Project, ProjectStatus, Client, CreateProjectRequest, UpdateProjectRequest } from '@synergia/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, FolderOpen, Calendar, Building2, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsResponse, clientsResponse] = await Promise.all([
        api.getProjects(),
        api.getClients()
      ]);

      if (projectsResponse.success && projectsResponse.data) {
        setProjects(projectsResponse.data);
      }
      
      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: CreateProjectRequest) => {
    try {
      const response = await api.createProject(data);
      if (response.success && response.data) {
        setProjects([response.data, ...projects]);
        setDialogOpen(false);
        toast.success('Projeto criado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao criar projeto');
    }
  };

  const handleUpdateProject = async (data: UpdateProjectRequest) => {
    try {
      const response = await api.updateProject(data);
      if (response.success && response.data) {
        setProjects(projects.map(project => 
          project.id === data.id ? response.data! : project
        ));
        setDialogOpen(false);
        setEditingProject(null);
        toast.success('Projeto atualizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar projeto');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await api.deleteProject(projectToDelete.id);
      setProjects(projects.filter(project => project.id !== projectToDelete.id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      toast.success('Projeto excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir projeto');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ProjectStatus) => {
    const variants = {
      PLANNED: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };

    const labels = {
      PLANNED: 'Planejado',
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-600">Gerencie seus projetos</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingProject(null)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
              </DialogTitle>
            </DialogHeader>
            <ProjectForm
              project={editingProject}
              clients={clients}
              onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={() => {
                setDialogOpen(false);
                setEditingProject(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar projetos por nome ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {getStatusBadge(project.status)}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        setEditingProject(project);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setProjectToDelete(project);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </p>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>{project.client?.name}</span>
              </div>
              
              {project.startDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(project.startDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  {project.endDate && (
                    <span>- {format(new Date(project.endDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                <span>Criado em {format(new Date(project.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto cadastrado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando seu primeiro projeto'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto "{projectToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}