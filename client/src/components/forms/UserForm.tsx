import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, UserRole, UserStatus, UpdateUserRequest } from '@synergia/types';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const inviteUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.nativeEnum(UserRole)
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus)
});

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const isEditing = !!user;
  const schema = isEditing ? updateUserSchema : inviteUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || UserRole.EMPLOYEE,
      status: user?.status || UserStatus.ACTIVE
    }
  });

  const selectedRole = watch('role');
  const selectedStatus = watch('status');

  const handleFormSubmit = (data: any) => {
    if (isEditing) {
      onSubmit({ ...data, id: user.id } as UpdateUserRequest);
    } else {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Nome completo"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="email@exemplo.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">Papel *</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => setValue('role', value as UserRole)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.EMPLOYEE}>Funcionário</SelectItem>
            <SelectItem value={UserRole.MANAGER}>Gerente</SelectItem>
            <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setValue('status', value as UserStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserStatus.ACTIVE}>Ativo</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Inativo</SelectItem>
              <SelectItem value={UserStatus.PENDING}>Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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
          {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Convidar')}
        </Button>
      </div>
    </form>
  );
}