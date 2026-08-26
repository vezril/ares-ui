{{- define "ares-ui.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ares-ui.fullname" -}}
{{- printf "%s" (include "ares-ui.name" .) -}}
{{- end -}}

{{- define "ares-ui.labels" -}}
app.kubernetes.io/name: {{ include "ares-ui.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: ui
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
{{- end -}}

{{- define "ares-ui.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ares-ui.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
