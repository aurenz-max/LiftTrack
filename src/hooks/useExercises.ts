import { useMemo, useState } from 'react'
import { EXERCISE_DATABASE } from '@/data/exercises'
import type { Exercise, MuscleGroup, Equipment } from '@/types'

export function useExercises() {
  const [searchQuery, setSearchQuery] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | ''>('')
  const [equipmentFilter, setEquipmentFilter] = useState<Equipment | ''>('')

  const filteredExercises = useMemo(() => {
    let results = EXERCISE_DATABASE

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
  }, [searchQuery, muscleFilter, equipmentFilter])

  const getExerciseById = (id: string): Exercise | undefined => {
    return EXERCISE_DATABASE.find((ex) => ex.id === id)
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
    allExercises: EXERCISE_DATABASE,
  }
}
