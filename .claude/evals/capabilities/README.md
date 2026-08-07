# Capability Benchmarks

This directory stores reusable agent capability evaluation fixtures. Keep diagnostic, validation, and holdout case IDs disjoint. Candidate authors may inspect diagnostic cases; validation details should be limited to what is needed for iteration; hidden holdout expected answers and rubrics must not be copied into candidate skills or prompts.

Each benchmark case should include a stable case ID, category, scenario, allowed context/tools, objective requirements, critical-failure conditions, rubric, and provenance. Prefer generalized Qarğa scenarios derived from real failure classes rather than exact copies of the incident that triggered research.

Do not mark a suite active until the evaluation engineer has reviewed case quality and the coordinator has confirmed it measures a durable capability rather than one implementation detail.
