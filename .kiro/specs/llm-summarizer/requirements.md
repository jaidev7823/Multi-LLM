# Requirements Document

## Introduction

This feature adds a summarizer LLM capability to the existing multi-LLM chat system. When users select 1 or more LLMs for chat, they can optionally select an additional summarizer LLM. Each chat LLM will be instructed to provide a concise, JavaScript-copyable summary at the end of their response, and the summarizer LLM will receive all these summaries to create a structured consolidated summary.

## Requirements

### Requirement 1

**User Story:** As a user chatting with one or more LLMs, I want to optionally select a summarizer LLM so that I can get a structured overview of all responses.

#### Acceptance Criteria

1. WHEN the user has selected 1 or more LLMs for chat THEN the system SHALL display an option to select a summarizer LLM
2. WHEN the user selects a summarizer LLM THEN the system SHALL treat it as an additional LLM separate from the main chat LLMs
3. IF a summarizer LLM is selected THEN the system SHALL automatically include it in every chat interaction
4. WHEN the user sends a message THEN the system SHALL send the message to selected chat LLMs with modified prompts and collect their summaries for the summarizer

### Requirement 2

**User Story:** As a user, I want each chat LLM to provide a concise summary when a summarizer is active so that the summarizer can work with structured input.

#### Acceptance Criteria

1. WHEN a summarizer LLM is selected THEN each chat LLM SHALL receive an additional prompt instruction
2. WHEN chat LLMs respond THEN they SHALL include a concise summary at the end of their response
3. WHEN generating summaries THEN chat LLMs SHALL be told their summary should be copyable by JavaScript/extension
4. WHEN chat LLMs provide summaries THEN they SHALL be informed that other LLMs are answering the same question and a summarizer will process all summaries

### Requirement 3

**User Story:** As a user, I want the summarizer LLM to receive all individual summaries and create a structured consolidated summary so that I can understand the key points from all responses.

#### Acceptance Criteria

1. WHEN all chat LLMs have responded THEN the system SHALL extract the summary portion from each response
2. WHEN summaries are collected THEN the system SHALL send them to the summarizer LLM with appropriate context
3. WHEN the summarizer receives summaries THEN it SHALL be told how many LLMs provided responses
4. WHEN the summarizer processes summaries THEN it SHALL create a structured consolidated summary

### Requirement 4

**User Story:** As a user, I want to easily identify which response is the summary so that I can quickly find the consolidated information.

#### Acceptance Criteria

1. WHEN displaying responses THEN the system SHALL clearly label the summarizer LLM response as "Summary"
2. WHEN showing multiple responses THEN the system SHALL visually distinguish the summary from individual LLM responses
3. WHEN the summarizer responds THEN the system SHALL position it in a way that makes it easy to locate
4. IF the user has selected a summarizer THEN the system SHALL show an indicator that summarization is active

### Requirement 5

**User Story:** As a user, I want to be able to enable or disable the summarizer without losing my LLM selections so that I have control over when I need summaries.

#### Acceptance Criteria

1. WHEN a summarizer is selected THEN the system SHALL provide an option to temporarily disable it
2. WHEN the summarizer is disabled THEN the system SHALL continue using the selected chat LLMs normally without summary prompts
3. WHEN re-enabling the summarizer THEN the system SHALL remember the previously selected summarizer LLM
4. IF the user changes their chat LLM selection THEN the summarizer selection SHALL remain independent