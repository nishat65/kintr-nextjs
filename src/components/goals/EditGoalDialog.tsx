'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormHelperText,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { X, Zap, TrendingUp, Target } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs, { Dayjs } from 'dayjs';
import { Goal, GoalFormValues } from '@/types';
import { useUpdateGoal } from '@/hooks/useGoals';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Max 120 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
  scope: z.enum(['day', 'month', 'year']),
  target_date: z.string().min(1, 'Target date is required'),
  target_time: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional(),
});

const PRIORITY_OPTIONS = [
  { value: 'none',   label: 'None',   color: '#6B6B80' },
  { value: 'low',    label: 'Low',    color: '#4CAF50' },
  { value: 'medium', label: 'Medium', color: '#F5C332' },
  { value: 'high',   label: 'High',   color: '#F5603A' },
];

const scopeOptions = [
  { value: 'day',   label: 'Day',   icon: <Zap size={16} />,        desc: 'Complete today', color: '#F5603A' },
  { value: 'month', label: 'Month', icon: <TrendingUp size={16} />, desc: 'This month',     color: '#3B72EE' },
  { value: 'year',  label: 'Year',  icon: <Target size={16} />,     desc: 'This year',      color: '#F5C332' },
];

const toInputValue = (target_date: string, scope: string) => {
  if (scope === 'month') return target_date.slice(0, 7);
  if (scope === 'year')  return target_date.slice(0, 4);
  return target_date;
};

interface EditGoalDialogProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
}

export const EditGoalDialog = ({ goal, open, onClose }: EditGoalDialogProps) => {
  const updateGoal = useUpdateGoal();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: goal.title,
      description: goal.description ?? '',
      scope: goal.scope,
      target_date: toInputValue(goal.target_date, goal.scope),
      target_time: '09:00',
      visibility: goal.visibility,
      priority: goal.priority ?? 'none',
    },
  });

  const scope = watch('scope');
  const targetDate = watch('target_date');
  const targetTime = watch('target_time');

  const dayjsDateTime: Dayjs = dayjs(
    `${targetDate || dayjs().format('YYYY-MM-DD')}T${targetTime || '09:00'}`
  );

  const onSubmit = async (values: GoalFormValues) => {
    let target_date = values.target_date;
    if (values.scope === 'month') target_date = `${dayjs(target_date).format('YYYY-MM')}-01`;
    if (values.scope === 'year')  target_date = `${dayjs(target_date).format('YYYY')}-01-01`;
    await updateGoal.mutateAsync({ id: goal.id, values: { ...values, target_date } });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '20px' } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Edit Goal</Typography>
        <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          {updateGoal.error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {(updateGoal.error as Error).message}
            </Alert>
          )}

          {/* Title */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Title</Typography>
          <TextField
            fullWidth
            sx={{ mb: 3 }}
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          {/* Description */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Description{' '}
            <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', fontSize: '13px' }}>
              (optional)
            </Box>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 3 }}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          {/* Scope */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Scope</Typography>
          <Controller
            name="scope"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                value={field.value}
                onChange={(_, v) => { if (v) field.onChange(v); }}
                sx={{ mb: 1, width: '100%', gap: 1, flexWrap: 'wrap' }}
              >
                {scopeOptions.map((opt) => (
                  <ToggleButton
                    key={opt.value}
                    value={opt.value}
                    sx={{
                      flex: 1,
                      minWidth: 80,
                      borderRadius: '12px !important',
                      border: `2px solid ${field.value === opt.value ? opt.color : '#E8E8F0'} !important`,
                      bgcolor: field.value === opt.value ? `${opt.color}15` : 'transparent',
                      color: field.value === opt.value ? opt.color : 'text.secondary',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      py: 1.5,
                    }}
                  >
                    {opt.icon}
                    <Typography variant="caption" fontWeight={700}>{opt.label}</Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
          />
          {errors.scope && <FormHelperText error>{errors.scope.message}</FormHelperText>}

          {/* Target date / datetime */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, mt: 2.5 }}>
            {scope === 'day' ? 'Target date & time' : 'Target date'}
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {scope === 'day' && (
              <DateTimePicker
                label="Date & Time"
                value={dayjsDateTime}
                onChange={(newVal) => {
                  if (newVal && newVal.isValid()) {
                    setValue('target_date', newVal.format('YYYY-MM-DD'));
                    setValue('target_time', newVal.format('HH:mm'));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 2 },
                    error: !!errors.target_date,
                    helperText: errors.target_date?.message,
                  },
                }}
              />
            )}

            {scope === 'month' && (
              <DatePicker
                label="Month"
                views={['year', 'month']}
                openTo="month"
                value={dayjs(targetDate || dayjs().format('YYYY-MM-DD'))}
                onChange={(newVal) => {
                  if (newVal && newVal.isValid()) {
                    setValue('target_date', newVal.format('YYYY-MM'));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 2 },
                    error: !!errors.target_date,
                    helperText: errors.target_date?.message,
                  },
                }}
              />
            )}

            {scope === 'year' && (
              <DatePicker
                label="Year"
                views={['year']}
                openTo="year"
                minDate={dayjs('2024-01-01')}
                maxDate={dayjs('2030-12-31')}
                value={dayjs(targetDate ? `${targetDate}-01-01` : `${dayjs().year()}-01-01`)}
                onChange={(newVal) => {
                  if (newVal && newVal.isValid()) {
                    setValue('target_date', newVal.format('YYYY'));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 2 },
                    error: !!errors.target_date,
                    helperText: errors.target_date?.message,
                  },
                }}
              />
            )}
          </LocalizationProvider>

          {/* Visibility */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: '12px',
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={700}>Make this goal public</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Anyone can see and cheer on public goals
              </Typography>
            </Box>
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value === 'public'}
                      onChange={(e) => field.onChange(e.target.checked ? 'public' : 'private')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#F5603A' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#F5603A' },
                      }}
                    />
                  }
                  label=""
                />
              )}
            />
          </Box>

          {/* Priority */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, mt: 2.5 }}>Priority</Typography>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                value={field.value ?? 'none'}
                onChange={(_, v) => { if (v) field.onChange(v); }}
                sx={{ gap: 1, flexWrap: 'wrap', mt: 0.5 }}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <ToggleButton
                    key={opt.value}
                    value={opt.value}
                    sx={{
                      flex: 1,
                      minWidth: 64,
                      borderRadius: '10px !important',
                      border: `2px solid ${field.value === opt.value ? opt.color : '#E8E8F0'} !important`,
                      bgcolor: field.value === opt.value ? `${opt.color}18` : 'transparent',
                      color: field.value === opt.value ? opt.color : 'text.secondary',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderColor: 'divider', color: 'text.secondary', flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || updateGoal.isPending}
            sx={{ flex: 2 }}
          >
            {isSubmitting || updateGoal.isPending
              ? <CircularProgress size={20} color="inherit" />
              : 'Save Changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
