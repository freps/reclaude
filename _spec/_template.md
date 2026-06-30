# Feature My Feature

# Change
(Owner: Change Manager)

## Summary

One line of summary.


## Description

Detailed understanding of change. Not how to implement it, but what to expect in the end.


## Diagram

One or more diagrams to help understand the implementation. I.e. it can be visualisations of screens, a screen flow, or a logical flow. Use ASCII diagrams.


# Architecture
(Owner: architect)

## E2E concept

If it is a E2E change (frontend and backend), add some sentences here what the princple idea is. 


## Frontend 

Short technical explaination what to do in frontend in order to build those features / solve issues. It should be written in a way that a frontend developer can understand it. 
Add a list of files, whith a short summary what to add / change there. 
Don't restrict developer too much, it is a recommendation.

## Backend 

Short technical explaination what to do in backend in order to build those features / solve issues. It should be written in a way that a backend developer can understand it.
Add a list of files, whith a short summary what to add / change there. 
Don't restrict developer too much, it is a recommendation.

## Diagram

Technical Diagrams, what to change / build. I.e. Data flow, API interfaces, UML, .. Use ASCII diagrams.


# QA Report
(Owner: fullstack-developer — self-verified)

Status: PASS | FAIL

Checks (only for sides touched; mark untouched as n/a):
- Frontend lint / format / typecheck: ✓/✗/n/a
- Backend lint / format / typecheck / tests: ✓/✗/n/a

Self-review: 1-2 lines on what was checked in the diff.
Issues found & fixed: count, or "none".
Outstanding: any blocker that could not be fixed — otherwise "none".


# Code Review
(Owner: code-reviewer — independent)

Verdict: APPROVE | CHANGES REQUESTED

Reviewed: 1-2 lines on what the diff does and what was focused on.

Blockers (empty if APPROVE):
- [side: frontend/backend] [file:line] — the problem, concretely.


# Technical Writer
(Owner: Technical Writer)

Give 1-3 sentences of summary what has been added or changed.
Add as list: References to files and line numbers what has been added or changed. 