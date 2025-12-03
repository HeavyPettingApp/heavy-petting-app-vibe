import {
    prefixes,
    genders,
    spokenLanguages,
    medicalSpecialties,
    boardCertifications,
    employmentTypes,
    rolePositions,
    emergencyContactRelationships,
} from '~/server/data/selectOptionsData.js'

export const useSupabase = () => {
    const supabase = useSupabaseClient()
    const supabaseLabelsCache = reactive({})

    const getLabel = (value, options) => {
        if (!value) return 'N/A'
        const option = options.find(opt => opt.value === value)
        return option ? option.label : value
    }

    const getLabels = (values, options) => {
        if (!values || !Array.isArray(values) || values.length === 0) return 'N/A'
        return values.map(val => {
            const option = options.find(opt => opt.value === val)
            return option ? option.label : val
        }).join(', ')
    }

    const getSupabaseLabels = (values, tableName, labelColumn, idColumn = 'id') => {
        if (!values || !Array.isArray(values) || values.length === 0) return 'N/A'

        const cacheKey = `${ tableName }:${ labelColumn }:${ values.join(',') }`
        if (supabaseLabelsCache[cacheKey]) return supabaseLabelsCache[cacheKey]

        // Initial placeholder
        supabaseLabelsCache[cacheKey] = 'Loading...'

        // Fetch data
        supabase
            .from(tableName)
            .select(labelColumn)
            .in(idColumn, values)
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching labels:', error)
                    supabaseLabelsCache[cacheKey] = 'Error loading labels'
                } else if (data) {
                    supabaseLabelsCache[cacheKey] = data.map(item => item[labelColumn]).join(', ')
                }
            })

        return supabaseLabelsCache[cacheKey]
    }

    return {
        getLabel,
        getLabels,
        getSupabaseLabels,
        prefixes,
        genders,
        spokenLanguages,
        medicalSpecialties,
        boardCertifications,
        employmentTypes,
        rolePositions,
        emergencyContactRelationships,
    }
}
