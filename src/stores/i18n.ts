import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type Language = 'pt' | 'en'

const translations = {
  pt: {
    app_name: 'PWA Reports',
    no_projects: 'Nenhum projeto ainda',
    create_new_project: 'Novo Projeto',
    projects: 'Projetos',
    settings: 'Configurações',
    empty_state_title: 'Nenhum projeto criado',
    empty_state_message: 'Crie seu primeiro projeto para começar a organizar fotos',
    create_project: 'Criar Projeto',
    project_name: 'Nome do Projeto',
    map_selection: 'Escolha um mapa',
    language: 'Idioma',
    inspection_t24: 'Inspeção T1–T24',
    tendons_retrofit: 'Retrofit de Tendões',
    about: 'Sobre',
    about_description: 'Organiza fotos de trabalho com triagem, revisão e exportação ZIP',
  },
  en: {
    app_name: 'PWA Reports',
    no_projects: 'No projects yet',
    create_new_project: 'New Project',
    projects: 'Projects',
    settings: 'Settings',
    empty_state_title: 'No projects created',
    empty_state_message: 'Create your first project to start organizing photos',
    create_project: 'Create Project',
    project_name: 'Project Name',
    map_selection: 'Choose a map',
    language: 'Language',
    inspection_t24: 'Inspection T1–T24',
    tendons_retrofit: 'Tendons Retrofit',
    about: 'About',
    about_description: 'Organize work photos with triage, review and ZIP export',
  },
}

export const useI18nStore = defineStore('i18n', () => {
  const language = ref<Language>(
    (localStorage.getItem('language') as Language) || 'pt'
  )

  const t = computed(() => translations[language.value])

  const setLanguage = (lang: Language) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  return {
    language,
    t,
    setLanguage,
  }
})
