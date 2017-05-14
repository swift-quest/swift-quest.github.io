---
---

<head>
  <meta charset="utf-8">
</head>

# SWIFT QUEST

{% for chapter in site.data.book.chapters %}
## {{ chapter.title }}

{% for section in chapter.sections %}
[{{ section.title }}]({{ section.id }}/)
{% endfor %}

{% endfor %}