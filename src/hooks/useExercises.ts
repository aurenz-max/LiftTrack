import { useMemo, useState } from 'react'
import { EXERCISE_DATABASE } from '@/data/exercises'
import type { Exercise, MuscleGroup, Equipment } from '@/types'

export function useExercises(customExercises: Exercise[] = []) {
  const [searchQuery, setSearchQuery] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | ''>('')
  const [equipmentFilter, setEquipmentFilter] = useState<Equipment | ''>('')

  const allExercisesDb = useMemo(
    () => [...EXERCISE_DATABASE, ...customExercises],
    [customExercises]
  )

  const filteredExercises = useMemo(() => {
    let results = allExercisesDb

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      results = results.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.aliases.some((a) => a.toLowerCase().includes(query))
      )
    }

    if (muscleFilter) {
      results = results.filter(
        (ex) =>
          ex.primaryMuscles.includes(muscleFilter) ||
          ex.secondaryMuscles.includes(muscleFilter)
      )
    }

    if (equipmentFilter) {
      results = results.filter((ex) => ex.equipment === equipmentFilter)
    }

    return results
  }, [searchQuery, muscleFilter, equipmentFilter, allExercisesDb])

  const getExerciseById = (id: string): Exercise | undefined => {
    return allExercisesDb.find((ex) => ex.id === id)
  }

  return {
    exercises: filteredExercises,
    searchQuery,
    setSearchQuery,
    muscleFilter,
    setMuscleFilter,
    equipmentFilter,
    setEquipmentFilter,
    getExerciseById,
    allExercises: allExercisesDb,
  }
}
