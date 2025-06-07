export interface Student {
  studentId: string;
  name: string;
  phoneNumber: string;
  parentIds: string[];
  classId?: string;
  level: string;
  address: string;
  isUnassigned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Parent {
  parentId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  studentIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Teacher {
  teacherId: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  classIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Class {
  classId: string;
  name: string;
  teacherId: string;
  studentIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
