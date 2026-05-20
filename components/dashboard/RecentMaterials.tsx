import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MaterialItem } from "@/components/materials/MaterialItem"
import type { Material } from "@/lib/types"

export function RecentMaterials({ materials }: { materials: Material[] }) {
  const recent = [...materials]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, 4)

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近资料</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.length ? (
          recent.map((material) => (
            <MaterialItem key={material.id} material={material} />
          ))
        ) : (
          <p className="text-sm text-slate-500">还没有添加资料。</p>
        )}
      </CardContent>
    </Card>
  )
}
