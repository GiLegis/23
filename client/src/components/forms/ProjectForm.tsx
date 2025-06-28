import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project, ProjectStatus, Client, CreateProjectRequest, UpdateProjectRequest } from '@synergia/types';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const projectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

interface ProjectFormProps {
  project?: Project | null;
  clients: Client[];
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, clients, onSubmit, onCancel }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || ProjectStatus.PLANNED,
      clientId: project?.clientId || '',
      startDate: project?.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : '',
      endDate: project?.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : ''
    }
  });

  const selectedStatus = watch('status');
  const selectedClientId = watch('clientId');

  const handleFormSubmit = (data: any) => {
    if (project) {
      onSubmit({ ...data, id: project.id } as UpdateProjectRequest);
    } else {
      onSubmit(data as CreateProjectRequest);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Nome do projeto"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">Cliente *</Label>
        <Select
          value={selectedClientId}
          onValueChange={(value) => setValue('clientId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clientId && (
          <p className="text-sm text-red-600">{errors.clientId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setValue('status', value as ProjectStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ProjectStatus.PLANNED}>Planejado</SelectItem>
            <SelectItem value={ProjectStatus.IN_PROGRESS}>Em Andamento</SelectItem>
            <SelectItem value={ProjectStatus.COMPLETED}>Concluído</SelectItem>
            <SelectItem value={ProjectStatus.CANCELLED}>Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Início</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Término</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descrição do projeto"
          rows={3}
        />
      </div>

      <div className="flex space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Salvando...' : (project ? 'Atualizar' : 'Criar')}
        </Button>
      </div>
    </form>
  );
}