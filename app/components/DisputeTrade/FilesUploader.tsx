import { S3 } from 'aws-sdk';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

const MAX_FILE_SIZE = 2000000; // 2 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

interface FilesUploaderParams {
	address: `0x${string}`;
	uuid: `0x${string}`;
	onUploadFinished?: (data: S3.ManagedUpload.SendData) => void;
}

const FilesUploader = ({ uuid, address, onUploadFinished }: FilesUploaderParams) => {
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string>();
	const [isUploading, setIsUploading] = useState(false);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		processFiles(acceptedFiles);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

	const processFiles = (newFiles: File[]) => {
		const invalidFiles = newFiles.filter(
			(file) => file.size > MAX_FILE_SIZE || !ALLOWED_FILE_TYPES.includes(file.type)
		);

		if (invalidFiles.length) {
			const errorMsg = `Invalid file(s): ${invalidFiles.map((file) => file.name).join(', ')}`;
			setError(errorMsg);
			return;
		}

		setFiles(newFiles);
		setError('');
	};

	const handleFileChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
		if (!target.files) return;

		processFiles(Array.from(target.files));
	};

	useEffect(() => {
		if (files.length) {
			setIsUploading(true);
			const formData = new FormData();
			formData.append('uuid', uuid);
			formData.append('address', address);

			files.forEach((file) => {
				formData.append('files', file);
			});

			fetch('/api/s3/dispute', {
				method: 'POST',
				body: formData,
				headers: {
					Accept: ALLOWED_FILE_TYPES.join(', ')
				}
			})
				.then((res) => res.json())
				.then(({ data }) => {
					setIsUploading(false);
					if (data.error) {
						setError(data.error);
					} else {
						onUploadFinished?.(data);
					}
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [files]);

	return (
		<label htmlFor="file-upload" className="bg-transparent relative cursor-pointer rounded-md font-medium">
			<div
				className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-cyan-600 bg-gray-100"
				{...getRootProps()}
			>
				<CloudArrowUpIcon className="text-cyan-600 w-10" />
				<div className="flex text-sm text-gray-600">
					<span className="text-cyan-600 underline hover:no-underline">Upload files</span>
					<input
						id="file-upload"
						name="file-upload"
						type="file"
						className="sr-only"
						multiple
						onChange={handleFileChange}
						disabled={isUploading}
						{...getInputProps()}
					/>
					<p className="pl-1">or drag and drop {isDragActive && 'the files here'}</p>
				</div>
				<p className="text-xs text-gray-500 py-2">Supported formats: JPEG, JPG, PNG, PDF</p>
			</div>
			{!!error && <p style={{ color: 'red' }}>{error}</p>}
		</label>
	);
};

export default FilesUploader;
