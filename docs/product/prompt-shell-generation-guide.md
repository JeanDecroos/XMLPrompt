# XMLPrompter Enhancement System: Prompt Shell Generation Guide

## Project Overview

XMLPrompter is a professional tool that transforms user input into structured XML prompts optimized for AI models. The core feature is an **Enhancement Scale (1-100%)** that controls how much creative freedom the AI has when refining and expanding user prompts.

## The Enhancement Scale System

The 1-100% scale represents increasing levels of AI creative freedom:

### 🟢 **Conservative Range (1-30%)**
- **1-15% (Minimal)**: Grammar and clarity fixes only - No new concepts
- **16-30% (Light)**: Minor improvements and structure - Original meaning preserved

### 🔵 **Balanced Range (31-70%)**  
- **31-50% (Moderate)**: Balanced improvements with slight creativity - Close to original intent
- **51-70% (Creative)**: Significant creative improvements - Expanded concepts while maintaining core intent

### 🟡 **High Freedom Range (71-85%)**
- **71-85% (High)**: Substantial creative additions - Some liberties may be taken

### 🔴 **Maximum Freedom Range (86-100%)**
- **86-100% (Maximum)**: Full creative freedom - May introduce inaccuracies or assumptions

## Your Task: Generate Prompt Enhancement Shells

**Objective**: Create 20 distinct "prompt shells" (templates) that demonstrate how prompts should be enhanced at different levels on the 1-100% scale.

### What Are Prompt Shells?

Prompt shells are **template structures** that show:
1. **What to add** at each enhancement level
2. **How to modify** existing content
3. **What risks/liberties** are acceptable
4. **Examples of enhancement patterns**

### Enhancement Level Breakdown (Every 5% Increment)

You need to create shells for: **5%, 10%, 15%, 20%, 25%, 30%, 35%, 40%, 45%, 50%, 55%, 60%, 65%, 70%, 75%, 80%, 85%, 90%, 95%, 100%**

### Input Format
Each prompt shell should work with this XML structure:
```xml
<prompt>
  <role>User's Role</role>
  <task>User's Task Description</task>
  <context>Background Information</context>
  <requirements>Specific Requirements</requirements>
  <style>Writing Style Preferences</style>
  <output>Expected Output Format</output>
</prompt>
```

### Expected Shell Structure

For each enhancement level (5%, 10%, 15%, etc.), create a shell that shows:

```markdown
## Enhancement Level: X%
**Risk Level**: [Safe/Low/Medium/High]
**Creative Freedom**: [Minimal/Light/Moderate/High/Maximum]

### Enhancement Rules:
- [What the AI should do at this level]
- [What boundaries to respect]
- [What creative liberties are allowed]

### Template Structure:
```xml
<prompt>
  <role>[How role should be enhanced at this level]</role>
  <task>[How task should be enhanced at this level]</task>
  <context>[How context should be enhanced at this level]</context>
  <requirements>[How requirements should be enhanced at this level]</requirements>
  <style>[Style enhancements for this level]</style>
  <output>[Output format enhancements for this level]</output>
</prompt>
```

### Example Enhancement Pattern:
[Show specific example of how a basic prompt transforms at this level]
```

### Key Principles

1. **Progressive Enhancement**: Each level should build upon previous levels
2. **Risk Awareness**: Higher levels (86-100%) acknowledge potential for "hallucination"/inaccuracy
3. **User Control**: Users understand the trade-offs between accuracy and creativity
4. **Professional Quality**: Even maximum enhancement should produce usable prompts

### Special Considerations

- **Levels 1-30%**: Focus on clarity, structure, grammar - NO new concepts
- **Levels 31-70%**: Allow contextual expansion and creative improvements
- **Levels 71-85%**: Permit substantial additions and creative interpretation  
- **Levels 86-100%**: Full creative freedom - may add assumptions, but should remain useful

### Output Requirements

Generate 20 distinct prompt shells that can be used as templates for enhancing user prompts at different levels. Each shell should be immediately usable by the XMLPrompter system to guide prompt enhancement at that specific percentage level.

The shells will be used to:
1. **Guide AI enhancement**: Show how prompts should change at each level
2. **Set user expectations**: Help users understand what each level delivers
3. **Maintain quality**: Ensure enhancements remain useful even at high levels
4. **Enable consistency**: Standardize enhancement patterns across different prompt types

---

**Note**: The term "hallucination" in this context refers to the intentional creative freedom allowed at higher enhancement levels (86-100%), where the AI may introduce plausible but potentially inaccurate additions to improve prompt effectiveness.