// src/modules/classes/ClassOverview.tsx
import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { gql } from "@apollo/client";
import {useQuery } from "@apollo/client/react";

import TeacherOverview from "./TeacherClassOverview";
import StudentOverview from "./StudentClassOverview";
import { Card, CardContent } from "@/components/ui/card";

const ME_QUERY = gql`
  query ClassOverview_Me {
    me {
      id
      role
      name
      email
    }
  }
`;

const CLASS_BY_ID = gql`
  query ClassOverview_ClassById($id: ID!) {
    class(id: $id) {
      id
      slug
      name
      subject
      period
      gradeLevel
      defaultCurrency
    }
  }
`;

const CLASS_BY_SLUG = gql`
  query ClassOverview_ClassBySlug($slug: String!) {
    class(slug: $slug) {
      id
      slug
      name
      subject
      period
      gradeLevel
      defaultCurrency
    }
  }
`;

export default function ClassOverview() {
  const { classId, slug } = useParams<{ classId?: string; slug?: string }>();

  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery(ME_QUERY, {
    fetchPolicy: "cache-first",
  });
  const me = meData?.me;

  const {
    data: bySlug,
    loading: loadingSlug,
    error: errorSlug,
  } = useQuery(CLASS_BY_SLUG, {
    variables: { slug: slug ?? "" },
    skip: !slug,
    fetchPolicy: "cache-first",
  });

  const {
    data: byId,
    loading: loadingId,
    error: errorId,
  } = useQuery(CLASS_BY_ID, {
    variables: { id: classId ?? "" },
    skip: !classId || !!slug,
    fetchPolicy: "cache-first",
  });

  const klass = bySlug?.class ?? byId?.class ?? null;
  const loading = meLoading || loadingSlug || loadingId;
  const error = meError ?? errorSlug ?? errorId ?? null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading…</CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600">
          {error.message || "Failed to load"}
        </CardContent>
      </Card>
    );
  }
  if (!klass) {
    return (
      <Card>
        <CardContent className="p-6">
          Couldn’t find that class.{" "}
          <Link to="/classes" className="underline">
            Back to classes
          </Link>
        </CardContent>
      </Card>
    );
  }
  if (!me) {
    return (
      <Card>
        <CardContent className="p-6">You must be signed in.</CardContent>
      </Card>
    );
  }

  // Dynamically render based on profile
  if (me.role === "TEACHER") {
    return <TeacherOverview klass={klass} />;
  }
  if (me.role === "STUDENT") {
    return <StudentOverview klass={klass} studentId={me.id} />;
  }

  // Fallback (parents or others)
  return (
    <Card>
      <CardContent className="p-6">
        Hi {me.name}. This view is optimized for Teachers and Students.
      </CardContent>
    </Card>
  );
}
