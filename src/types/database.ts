export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      configuracoes: {
        Row: {
          atualizado_em: string
          cor_primaria: string | null
          cor_secundaria: string | null
          endereco: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          nome: string
          whatsapp: string | null
        }
        Insert: {
          atualizado_em?: string
          cor_primaria?: string | null
          cor_secundaria?: string | null
          endereco?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nome: string
          whatsapp?: string | null
        }
        Update: {
          atualizado_em?: string
          cor_primaria?: string | null
          cor_secundaria?: string | null
          endereco?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nome?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      imoveis: {
        Row: {
          aceita_permuta: boolean
          area_construida: number | null
          area_total: number | null
          atualizado_em: string
          bairro: string | null
          banheiros: number | null
          cidade: string | null
          comissao_aluguel_tipo: Database["public"]["Enums"]["tipo_comissao"] | null
          comissao_aluguel_valor: number | null
          comissao_venda_tipo: Database["public"]["Enums"]["tipo_comissao"] | null
          comissao_venda_valor: number | null
          comodidades: string[]
          criado_em: string
          descricao: string | null
          destaque: boolean
          documentacao_publica: boolean
          endereco: string | null
          finalidade: Database["public"]["Enums"]["finalidade_imovel"]
          id: string
          observacoes_documentacao: string | null
          origem: Database["public"]["Enums"]["origem_imovel"]
          permuta_obs: string | null
          proprietario_contato: string | null
          proprietario_nome: string | null
          publicado: boolean
          quartos: number | null
          status: Database["public"]["Enums"]["status_imovel"]
          taxas_adicionais: string | null
          tipo_id: string
          titulo: string
          vagas: number | null
          valor_aluguel: number | null
          valor_venda: number | null
        }
        Insert: {
          aceita_permuta?: boolean
          area_construida?: number | null
          area_total?: number | null
          atualizado_em?: string
          bairro?: string | null
          banheiros?: number | null
          cidade?: string | null
          comissao_aluguel_tipo?: Database["public"]["Enums"]["tipo_comissao"] | null
          comissao_aluguel_valor?: number | null
          comissao_venda_tipo?: Database["public"]["Enums"]["tipo_comissao"] | null
          comissao_venda_valor?: number | null
          comodidades?: string[]
          criado_em?: string
          descricao?: string | null
          destaque?: boolean
          documentacao_publica?: boolean
          endereco?: string | null
          finalidade: Database["public"]["Enums"]["finalidade_imovel"]
          id?: string
          observacoes_documentacao?: string | null
          origem?: Database["public"]["Enums"]["origem_imovel"]
          permuta_obs?: string | null
          proprietario_contato?: string | null
          proprietario_nome?: string | null
          publicado?: boolean
          quartos?: number | null
          status?: Database["public"]["Enums"]["status_imovel"]
          taxas_adicionais?: string | null
          tipo_id: string
          titulo: string
          vagas?: number | null
          valor_aluguel?: number | null
          valor_venda?: number | null
        }
        Update: {
          aceita_permuta?: boolean
          area_construida?: number | null
          area_total?: number | null
          atualizado_em?: string
          bairro?: string | null
          banheiros?: number | null
          cidade?: string | null
          comissao_aluguel_tipo?: Database["public"]["Enums"]["tipo_comissao"] | null
          comissao_aluguel_valor?: number | null
          comissao_venda_tipo?: Database["public"]["Enums"]["tipo_comissao"] | null
          comissao_venda_valor?: number | null
          comodidades?: string[]
          criado_em?: string
          descricao?: string | null
          destaque?: boolean
          documentacao_publica?: boolean
          endereco?: string | null
          finalidade?: Database["public"]["Enums"]["finalidade_imovel"]
          id?: string
          observacoes_documentacao?: string | null
          origem?: Database["public"]["Enums"]["origem_imovel"]
          permuta_obs?: string | null
          proprietario_contato?: string | null
          proprietario_nome?: string | null
          publicado?: boolean
          quartos?: number | null
          status?: Database["public"]["Enums"]["status_imovel"]
          taxas_adicionais?: string | null
          tipo_id?: string
          titulo?: string
          vagas?: number | null
          valor_aluguel?: number | null
          valor_venda?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_imovel"
            referencedColumns: ["id"]
          },
        ]
      }
      imovel_imagens: {
        Row: {
          capa: boolean
          id: string
          imovel_id: string
          ordem: number
          url: string
        }
        Insert: {
          capa?: boolean
          id?: string
          imovel_id: string
          ordem?: number
          url: string
        }
        Update: {
          capa?: boolean
          id?: string
          imovel_id?: string
          ordem?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "imovel_imagens_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imovel_imagens_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_imovel: {
        Row: {
          ativo: boolean
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      visitas: {
        Row: {
          data_visita: string
          id: string
          imovel_id: string
          observacoes: string | null
          responsavel: string | null
          visitante_contato: string | null
          visitante_nome: string
        }
        Insert: {
          data_visita?: string
          id?: string
          imovel_id: string
          observacoes?: string | null
          responsavel?: string | null
          visitante_contato?: string | null
          visitante_nome: string
        }
        Update: {
          data_visita?: string
          id?: string
          imovel_id?: string
          observacoes?: string | null
          responsavel?: string | null
          visitante_contato?: string | null
          visitante_nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      imoveis_publicos: {
        Row: {
          aceita_permuta: boolean | null
          area_construida: number | null
          area_total: number | null
          atualizado_em: string | null
          bairro: string | null
          banheiros: number | null
          cidade: string | null
          comodidades: string[] | null
          criado_em: string | null
          descricao: string | null
          destaque: boolean | null
          endereco: string | null
          finalidade: Database["public"]["Enums"]["finalidade_imovel"] | null
          id: string | null
          observacoes_documentacao: string | null
          permuta_obs: string | null
          quartos: number | null
          status: Database["public"]["Enums"]["status_imovel"] | null
          taxas_adicionais: string | null
          tipo_id: string | null
          tipo_nome: string | null
          titulo: string | null
          vagas: number | null
          valor_aluguel: number | null
          valor_venda: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_imovel"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      finalidade_imovel: "venda" | "aluguel" | "ambos"
      origem_imovel: "proprio" | "intermediacao"
      status_imovel: "disponivel" | "reservado" | "vendido" | "alugado"
      tipo_comissao: "percentual" | "fixo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      finalidade_imovel: ["venda", "aluguel", "ambos"],
      origem_imovel: ["proprio", "intermediacao"],
      status_imovel: ["disponivel", "reservado", "vendido", "alugado"],
      tipo_comissao: ["percentual", "fixo"],
    },
  },
} as const
